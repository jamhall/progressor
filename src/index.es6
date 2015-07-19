import Helpers from './helpers'
import pad from 'pad';
import {
    sprintf
}
from 'sprintf';
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
        this.overwrite = (message) => {
            _output('overwriting');
            let lines = message.split("\n");
        }

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
                text = formatter.call();
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
            lines.forEach((line, index) => {
                if (this.lastMessagesLength > Helpers.strlenWithoutDecoration(line)) {
                    lines[index] = pad(line, this.lastMessagesLength, "\x20");
                }
            });
        }

        this.output.write("\x0D");
        this.output.write(lines.join("\n"));
        this.lastMessagesLength = 0;
        lines.forEach((line) => {
            let len = Helpers.strlenWithoutDecoration(line);
            if (len > this.lastMessagesLength) {
                this.lastMessagesLength = len;
            }
        });
    }

    getBarCharacter() {
        if (null === this.options.barChar) {
            return this.max ? '=' : this.options.emptyBarChar;
        }
        return this.options.barChar;
    }

    initPlaceholders() {
        return {
            'bar': () => {
                let completeBars = Math.floor(this.max > 0 ? this.percent * this.options.barWidth : this.step % this.options.barWidth);
                let display = this.getBarCharacter()
                    .repeat(completeBars);
                if (completeBars < this.options.barWidth) {
                    let emptyBars = this.options.barWidth - completeBars - Helpers.strlenWithoutDecoration(this.options.progressChar);
                    display = display + this.options.progressChar + this.options.emptyBarChar.repeat(emptyBars);
                }
                return display;
            },
            'elapsed': () => {
                let seconds = (Date.now() - this.startTime) / 1000;
                return Helpers.formatTime(seconds);
            },
            'max': () => {
                return this.max;
            },
            'percent': () => {
                return Math.floor(this.percent * 100);
            },
            'estimated': () => {
                let estimated;
                if (!this.max) {
                    throw new Error('Unable to display the estimated time if the maximum number of steps is not set.');
                }
                if (!this.step) {
                    estimated = 0;
                } else {
                    estimated = Math.round(((Date.now() - this.startTime) / 1000) / this.step * this.max);
                }
                return Helpers.formatTime(estimated);
            },
            'current': () => {
                return pad(this.step.toString(), this.options.stepWidth, ' ');
            },
            'memory': () => {
                let memoryUsage = process.memoryUsage();
                return Helpers.formatMemory(memoryUsage.rss);
            },
            'remaining': () => {
                let remaining;
                if (!this.max) {
                    throw new Error('Unable to display the remaining time if the maximum number of steps is not set.');
                }
                if (!this.step) {
                    remaining = 0;
                } else {
                    remaining = Math.round(((Date.now() - this.startTime) / 1000) / this.step * (this.max - this.step));
                }
                return Helpers.formatTime(remaining);
            }
        }
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
};

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
