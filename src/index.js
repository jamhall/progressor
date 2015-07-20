import Helpers from './helpers'
import pad from 'pad';
import { sprintf } from 'sprintf-js';
import _ from 'lodash';
import repeat from 'repeat-string';
import charm from 'charm';
import colors from 'colors';
import strformat from 'strformat';
class Progressor {

  constructor(options, max = null) {
    this.options = {
      barWidth: 28,
      emptyBarChar: ' '.bgRed,
      progressChar: '',
      redrawFreq: 1,
      overwrite: true,
      barChar: null,
      format: 'normal',
      stream: process.stdout,
      beforeNewlines: null,
      afterNewlines: 1
    };

    this.started = false;
    this.step = 0;
    this.max = max;
    this.percent = 0.0;
    this.lastMessagesLength = 0;
    this.messages = {};
    this.formatters = null;
    this.options = _.merge(this.options, options);
    this.output = charm();
    this.output.pipe(process.stdout);

    let tokens = {
      'current': '%current%'.bold,
      'max': '%max%'.bold,
      'percent': '%percent:3s%%'.bold,
      'elapsed' : '%elapsed:6s%'.bold,
      'estimated': '%estimated:-6s%'.bold,
      'memory': '%memory:6s%'.bold,
      'bar': '%bar%'
    };

    this.formats = _.merge({
      'normal': strformat('{current}/{max} {bar} {percent}', tokens),
      'normal_nomax': strformat(' {current} {bar}', tokens),
      'verbose': strformat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%', tokens),
      'verbose_nomax': strformat(' {current} {bar} {elapsed}', tokens),
      'very_verbose': strformat(' {current}/{max} {bar} {percent} {elapsed}/{estimated}', tokens),
      'very_verbose_nomax': strformat(' {current} {bar} {elapsed}', tokens),
      'debug': strformat(' {current}/{max}  {bar} {percent} {elapsed}/{estimated} {memory}', tokens),
      'debug_nomax': strformat(' {current} {bar} {elapsed} {memory}', tokens)
    }, Progressor._customFormats);

    this.format = this.formats[this.options.format];

    if (!this.format) {
      this.format = this.options.format;
    }

    let lineCount = this.format.split("\n").length - 1;

    if (lineCount > 1) {
      this.formatLineCount = lineCount;
    }
  }

  isComplete() {
    if (this.step === this.max) {
      return true;
    }
    return false;
  }

  getFormats() {
    return Progressor._formats;
  }

  setMaxSteps(max) {
    this.max = Math.max(0, parseInt(max));
    this.stepWidth = this.max ? this.max.toString().length : 4;
  }

  /**
   * Outputs the current progress string.
   */
  display() {
    this.update(this.format.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/g, (matches, part1, part2) => {
      let text;
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

  clear() {
    if (!this.options.overwrite) {
      return;
    }
    this.update(repeat("\n", this.formatLineCount));
  }

  /**
   * Removes the progress bar from the current line.
   *
   * This is useful if you wish to write some output
   * while a progress bar is running.
   * Call display() to show the progress bar again.
   */
  clear() {
    if (!this.options.overwrite) {
      return;
    }
    this.output.write(repeat("\n", 4));
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
    if (this.started === false) {
      throw new Error('You must call start before you can advance the progress bar');
    }
    step = parseInt(step);
    if (step < this.step) {
      throw new Error('You can\'t regress the progress bar.');
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
    this.output.cursor(false);
    let lines = message.split("\n");
    if (null !== this.lastMessagesLength) {
      for (let index in lines) {
        let line = lines[index];
        if (this.lastMessagesLength > Helpers.strlenWithoutDecoration(line)) {
          lines[index] = pad(line, this.lastMessagesLength, "\x20");
        }
      }
    }

    if (this.options.overwrite) {
      // move back to the beginning of the progress bar before redrawing it
      this.output.write("\x0D");
    } else if (this.step > 0) {
      this.output.write("\n");
    }

    if (this.formatLineCount) {
      //this.output.up(this.formatLinecount);
      this.output.write(sprintf("\033[%dA", this.formatLineCount));
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
      return this.max ? '='.green.bgGreen : this.options.emptyBarChar;
    }
    return this.options.barChar;
  }

  initPlaceholders() {
    let placeholders = {
      'bar': (bar) => {
        let completeBars = Math.floor
        (bar.max > 0 ? bar.percent * bar.options.barWidth : bar.step % bar.options.barWidth);
        let display = repeat(bar.getBarCharacter(), completeBars);
        if (completeBars < bar.options.barWidth) {
          let emptyBars = bar.options.barWidth - completeBars - Helpers.strlenWithoutDecoration(bar.options.progressChar);
          display = display + bar.options.progressChar + repeat(bar.options.emptyBarChar, emptyBars);
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
    };
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

  start(max = null) {
    this.started = true;
    if (this.options.beforeNewlines) {
      this.output.write(repeat("\n", parseInt(this.options.beforeNewlines)));
    }
    this.startTime = Date.now();
    this.step = 0;
    this.percent = 0.0;
    if (null !== max) {
      this.setMaxSteps(max);
    }
    this.display();
  }

  /**
   * Finishes the progress output.
   */
  finish() {
    if (!this.max) {
      this.max = this.step;
    }
    if (this.step === this.max && !this.options.overwrite) {
      return;
    }
    this.setProgress(this.max);
    if (this.options.afterNewlines) {
      this.output.write(repeat("\n", parseInt(this.options.afterNewlines)));
    }
  }

  static addFormat(name, definition) {
    this._customFormats[name] = definition;
  }

  static setPlaceholderFormatDefinition(name, definition) {
    this._customPlaceholders[name] = definition;
  }
}
;

Progressor._customPlaceholders = {};

Progressor._customFormats = {};

export default Progressor;
