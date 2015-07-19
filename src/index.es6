import Helpers from './helpers'
import pad from 'pad';
import {
    sprintf
}
from 'sprintf';
import _ from 'lodash';
class Progressor {

    constructor(options, max) {
        this._ = require('lodash');

        this.options = {
            barWidth: 28,
            emptyBarChar: '-',
            progressChar: '>',
            redrawFreq: 1,
            barChar: null,
            format: 'normal'
        }

        this.step = 0;
        this.stepWidth;
        this.max;
        this.startTime;
        this.percent = 0.0;
        this.lastMessagesLength = 0;
        this.formatLineCount;
        this.messages = {};
        this.overwrite = true;
        this.output = process.stdout;
        this.formatters = null;
        this.max = this._setMaxSteps(max);
        this.options = this._.merge(this.options, options);
        this.format = Progressor._formats[this.options.format];
    }

    getFormats() {
        return Progressor._formats;
    }

    start(max = null) {
        this.startTime = Date.now();
        this.step = 0;
        this.percent = 0.0;
        if (null !== max) {
            this._setMaxSteps(max);
        }
        this.display();
    }

    _setMaxSteps(max) {
        let _max = Math.max(0, max);
        this.stepWidth = _max ? _max.toString()
            .length : 4;
        return _max;
    }

    /**
     * Outputs the current progress string.
     */
    display() {
        let text;
        this.update(this.format.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/g, (matches, part1, part2) => {
            var formatter = this.getPlaceholderFormatterDefinition(part1);
            if (formatter) {
                text = formatter(this);
            } else if (this.messages.hasOwnProperty(part1)) {
                text = this.messages[part1];
            } else {
                return matches;
            }

            if (part2) {
                text = sprintf('%' + part2, text);
            }
            return text;
        }));
    }

    clearLine() {
            this.output.clearLine();
        }
        /**
         * Removes the progress bar from the current line.
         *
         * This is useful if you wish to write some output
         * while a progress bar is running.
         * Call display() to show the progress bar again.
         */
    clear() {
        "\n".repeat(4);
    }

    /**
     * Advances the progress output X steps
     */
    advance(step = 1) {
        this.setProgress(this.step + step);
    }

    /**
     * Sets the current progress
     */
    setProgress(step) {
            step = parseInt(step);
            if (step < this.step) {
                throw new Exception('You can\'t regress the progress bar.');
            }
            if (this.max && step > this.max) {
                this.max = step;
            }
            let previousPeriod = parseInt(this.step / this.options.redrawFreq);
            let currentPeriod = parseInt(step / this.options.redrawFreq);
            this.step = step;
            this.percent = this.max ? parseFloat(this.step / this.max) : 0;
            if (previousPeriod !== currentPeriod || this.max == step) {
                this.display();
            }
        }
        /**
         * Updates the display
         */
    update(message) {
        let lines = message.split("\n");
        if (null !== this.lastMessagesLength) {
          for (let index in lines) {
            let line = lines[index];
            if (this.lastMessagesLength > Helpers.strlenWithoutDecoration(line)) {
                lines[index] = pad(line, this.lastMessagesLength, "\x20");
            }
          }
        }

        if (this.overwrite) {
          // move back to the beginning of the progress bar before redrawing it
          this.output.write("\x0D");
        } else if(this.step > 0) {
          this.output.write("\n");
        }

        this.output.write(lines.join("\n"));
        this.lastMessagesLength = 0;

        for (let index in lines) {
          let line = lines[index];
          let len = Helpers.strlenWithoutDecoration(line);

          if (len > this.lastMessagesLength) {
              this.lastMessagesLength = len;
          }
        }
    }

    getBarCharacter() {
        if (null === this.options.barChar) {
            return this.max ? '=' : this.options.emptyBarChar;
        }
        return this.options.barChar;
    }

    initPlaceholders() {
        let placeholders =  {
            'bar': (bar) => {
                let completeBars = Math.floor(bar.max > 0 ? bar.percent * bar.options.barWidth : bar.step % bar.options.barWidth);
                let display = bar.getBarCharacter()
                    .repeat(completeBars);
                if (completeBars < bar.options.barWidth) {
                    let emptyBars = bar.options.barWidth - completeBars - Helpers.strlenWithoutDecoration(bar.options.progressChar);
                    display = display + bar.options.progressChar + bar.options.emptyBarChar.repeat(emptyBars);
                }
                return display;
            },
            'elapsed': (bar) => {
                let seconds = (Date.now() - bar.startTime) / 1000;
                return Helpers.formatTime(seconds);
            },
            'max': (bar) => {
                return bar.max;
            },
            'percent': (bar) => {
                return Math.floor(bar.percent * 100);
            },
            'estimated': (bar) => {
                let estimated;
                if (!bar.max) {
                    throw new Error('Unable to display the estimated time if the maximum number of steps is not set.');
                }
                if (!bar.step) {
                    estimated = 0;
                } else {
                    estimated = Math.round(((Date.now() - bar.startTime) / 1000) / bar.step * bar.max);
                }
                return Helpers.formatTime(estimated);
            },
            'current': (bar) => {
                return pad(bar.step.toString(), bar.options.stepWidth, ' ');
            },
            'memory': (bar) => {
                let memoryUsage = process.memoryUsage();
                return Helpers.formatMemory(memoryUsage.rss);
            },
            'remaining': (bar) => {
                let remaining;
                if (!bar.max) {
                    throw new Error('Unable to display the remaining time if the maximum number of steps is not set.');
                }
                if (!bar.step) {
                    remaining = 0;
                } else {
                    remaining = Math.round(((Date.now() - bar.startTime) / 1000) / bar.step * (bar.max - bar.step));
                }
                return Helpers.formatTime(remaining);
            }
        }
        return _.merge(placeholders, Progressor._customPlaceholders);
    }
    getPlaceholderFormatterDefinition(formatter) {
        if (!this.formatters) {
            this.formatters = this.initPlaceholders();
        }
        return this.formatters.hasOwnProperty(formatter) ? this.formatters[formatter] : null;
    }

    setMessage(message, name = 'message') {
        this.messages[name] = message;
    }
    /**
     * Finishes the progress output.
     */
    finish() {
        if (!this.max) {
            this.max = this.step;
        }
        if (this.step === this.max && !this.overwrite) {
            return;
        }
        this.setProgress(this.max);
    }
    static addFormat(name, definition) {
        this._formats[name] = definition;
    }
    static setPlaceholderFormatDefinition(name, definition) {
      this._customPlaceholders[name] = definition;
    }
};

Progressor._customPlaceholders = {};

Progressor._formats = {
    'normal': ' %current%/%max% [%bar%] %percent:3s%%',
    'normal_nomax': ' %current% [%bar%]',
    'verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
    'verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
    'very_verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
    'very_verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
    'debug': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
    'debug_nomax': ' %current% [%bar%] %elapsed:6s% %memory:6s%'
}
export default Progressor;
