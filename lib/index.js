Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _pad = require('pad');

var _pad2 = _interopRequireDefault(_pad);

var _sprintfJs = require('sprintf-js');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _repeatString = require('repeat-string');

var _repeatString2 = _interopRequireDefault(_repeatString);

var _charm = require('charm');

var _charm2 = _interopRequireDefault(_charm);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _strformat = require('strformat');

var _strformat2 = _interopRequireDefault(_strformat);

var Progressor = (function () {
  function Progressor(options) {
    var max = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Progressor);

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
    this.options = _lodash2['default'].merge(this.options, options);
    this.output = (0, _charm2['default'])();
    this.output.pipe(process.stdout);

    var tokens = {
      'current': '%current%'.bold,
      'max': '%max%'.bold,
      'percent': '%percent:3s%%'.bold,
      'elapsed': '%elapsed:6s%'.bold,
      'estimated': '%estimated:-6s%'.bold,
      'memory': '%memory:6s%'.bold,
      'bar': '%bar%'
    };

    this.formats = _lodash2['default'].merge({
      'normal': (0, _strformat2['default'])('{current}/{max} {bar} {percent}', tokens),
      'normal_nomax': (0, _strformat2['default'])(' {current} {bar}', tokens),
      'verbose': (0, _strformat2['default'])(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%', tokens),
      'verbose_nomax': (0, _strformat2['default'])(' {current} {bar} {elapsed}', tokens),
      'very_verbose': (0, _strformat2['default'])(' {current}/{max} {bar} {percent} {elapsed}/{estimated}', tokens),
      'very_verbose_nomax': (0, _strformat2['default'])(' {current} {bar} {elapsed}', tokens),
      'debug': (0, _strformat2['default'])(' {current}/{max}  {bar} {percent} {elapsed}/{estimated} {memory}', tokens),
      'debug_nomax': (0, _strformat2['default'])(' {current} {bar} {elapsed} {memory}', tokens)
    }, Progressor._customFormats);

    this.format = this.formats[this.options.format];

    if (!this.format) {
      this.format = this.options.format;
    }

    var lineCount = this.format.split('\n').length - 1;

    if (lineCount > 1) {
      this.formatLineCount = lineCount;
    }
  }

  _createClass(Progressor, [{
    key: 'isComplete',
    value: function isComplete() {
      if (this.step === this.max) {
        return true;
      }
      return false;
    }
  }, {
    key: 'getFormats',
    value: function getFormats() {
      return Progressor._formats;
    }
  }, {
    key: 'setMaxSteps',
    value: function setMaxSteps(max) {
      this.max = Math.max(0, parseInt(max));
      this.stepWidth = this.max ? this.max.toString().length : 4;
    }
  }, {
    key: 'display',

    /**
     * Outputs the current progress string.
     */
    value: function display() {
      var _this = this;

      this.update(this.format.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/g, function (matches, part1, part2) {
        var text = undefined;
        var formatter = _this.getPlaceholderFormatterDefinition(part1);
        if (formatter) {
          text = formatter(_this);
        } else if (_this.messages.hasOwnProperty(part1)) {
          text = _this.messages[part1];
        } else {
          return matches;
        }

        if (part2) {
          text = (0, _sprintfJs.sprintf)('%' + part2, text);
        }
        return text;
      }));
    }
  }, {
    key: 'clearLine',
    value: function clearLine() {
      this.output.clearLine();
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (!this.options.overwrite) {
        return;
      }
      this.update((0, _repeatString2['default'])('\n', this.formatLineCount));
    }
  }, {
    key: 'clear',

    /**
     * Removes the progress bar from the current line.
     *
     * This is useful if you wish to write some output
     * while a progress bar is running.
     * Call display() to show the progress bar again.
     */
    value: function clear() {
      if (!this.options.overwrite) {
        return;
      }
      this.output.write((0, _repeatString2['default'])('\n', 4));
    }
  }, {
    key: 'advance',

    /**
     * Advances the progress output X steps
     */
    value: function advance() {
      var step = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      this.setProgress(this.step + step);
    }
  }, {
    key: 'setProgress',

    /**
     * Sets the current progress
     */
    value: function setProgress(step) {
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
      var previousPeriod = parseInt(this.step / this.options.redrawFreq);
      var currentPeriod = parseInt(step / this.options.redrawFreq);
      this.step = step;
      this.percent = this.max ? parseFloat(this.step / this.max) : 0;
      if (previousPeriod !== currentPeriod || this.max == step) {
        this.display();
      }
    }
  }, {
    key: 'update',

    /**
     * Updates the display
     */
    value: function update(message) {
      this.output.cursor(false);
      var lines = message.split('\n');
      if (null !== this.lastMessagesLength) {
        for (var index in lines) {
          var line = lines[index];
          if (this.lastMessagesLength > _helpers2['default'].strlenWithoutDecoration(line)) {
            lines[index] = (0, _pad2['default'])(line, this.lastMessagesLength, ' ');
          }
        }
      }

      if (this.options.overwrite) {
        // move back to the beginning of the progress bar before redrawing it
        this.output.write('\r');
      } else if (this.step > 0) {
        this.output.write('\n');
      }

      if (this.formatLineCount) {
        //this.output.up(this.formatLinecount);
        this.output.write((0, _sprintfJs.sprintf)('\u001b[%dA', this.formatLineCount));
      }

      this.output.write(lines.join('\n'));
      this.lastMessagesLength = 0;

      for (var index in lines) {
        var line = lines[index];
        var len = _helpers2['default'].strlenWithoutDecoration(line);

        if (len > this.lastMessagesLength) {
          this.lastMessagesLength = len;
        }
      }
    }
  }, {
    key: 'getBarCharacter',
    value: function getBarCharacter() {
      if (null === this.options.barChar) {
        return this.max ? ' '.green.bgGreen : this.options.emptyBarChar;
      }
      return this.options.barChar;
    }
  }, {
    key: 'initPlaceholders',
    value: function initPlaceholders() {
      var placeholders = {
        'bar': function bar(_bar) {
          var completeBars = Math.floor(_bar.max > 0 ? _bar.percent * _bar.options.barWidth : _bar.step % _bar.options.barWidth);
          var display = (0, _repeatString2['default'])(_bar.getBarCharacter(), completeBars);
          if (completeBars < _bar.options.barWidth) {
            var emptyBars = _bar.options.barWidth - completeBars - _helpers2['default'].strlenWithoutDecoration(_bar.options.progressChar);
            display = display + _bar.options.progressChar + (0, _repeatString2['default'])(_bar.options.emptyBarChar, emptyBars);
          }
          return display;
        },
        'elapsed': function elapsed(bar) {
          var seconds = (Date.now() - bar.startTime) / 1000;
          return _helpers2['default'].formatTime(seconds);
        },
        'max': function max(bar) {
          return bar.max;
        },
        'percent': function percent(bar) {
          return Math.floor(bar.percent * 100);
        },
        'estimated': function estimated(bar) {
          var estimated = undefined;
          if (!bar.max) {
            throw new Error('Unable to display the estimated time if the maximum number of steps is not set.');
          }
          if (!bar.step) {
            estimated = 0;
          } else {
            estimated = Math.round((Date.now() - bar.startTime) / 1000 / bar.step * bar.max);
          }
          return _helpers2['default'].formatTime(estimated);
        },
        'current': function current(bar) {
          return (0, _pad2['default'])(bar.step.toString(), bar.options.stepWidth, ' ');
        },
        'memory': function memory(bar) {
          var memoryUsage = process.memoryUsage();
          return _helpers2['default'].formatMemory(memoryUsage.rss);
        },
        'remaining': function remaining(bar) {
          var remaining = undefined;
          if (!bar.max) {
            throw new Error('Unable to display the remaining time if the maximum number of steps is not set.');
          }
          if (!bar.step) {
            remaining = 0;
          } else {
            remaining = Math.round((Date.now() - bar.startTime) / 1000 / bar.step * (bar.max - bar.step));
          }
          return _helpers2['default'].formatTime(remaining);
        }
      };
      return _lodash2['default'].merge(placeholders, Progressor._customPlaceholders);
    }
  }, {
    key: 'getPlaceholderFormatterDefinition',
    value: function getPlaceholderFormatterDefinition(formatter) {
      if (!this.formatters) {
        this.formatters = this.initPlaceholders();
      }
      return this.formatters.hasOwnProperty(formatter) ? this.formatters[formatter] : null;
    }
  }, {
    key: 'setMessage',
    value: function setMessage(message) {
      var name = arguments.length <= 1 || arguments[1] === undefined ? 'message' : arguments[1];

      this.messages[name] = message;
    }
  }, {
    key: 'start',
    value: function start() {
      var max = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.started = true;
      if (this.options.beforeNewlines) {
        this.output.write((0, _repeatString2['default'])('\n', parseInt(this.options.beforeNewlines)));
      }
      this.startTime = Date.now();
      this.step = 0;
      this.percent = 0.0;
      if (null !== max) {
        this.setMaxSteps(max);
      }
      this.display();
    }
  }, {
    key: 'finish',

    /**
     * Finishes the progress output.
     */
    value: function finish() {
      if (!this.max) {
        this.max = this.step;
      }
      if (this.step === this.max && !this.options.overwrite) {
        return;
      }
      this.setProgress(this.max);
      if (this.options.afterNewlines) {
        this.output.write((0, _repeatString2['default'])('\n', parseInt(this.options.afterNewlines)));
      }
    }
  }], [{
    key: 'addFormat',
    value: function addFormat(name, definition) {
      this._customFormats[name] = definition;
    }
  }, {
    key: 'setPlaceholderFormatDefinition',
    value: function setPlaceholderFormatDefinition(name, definition) {
      this._customPlaceholders[name] = definition;
    }
  }]);

  return Progressor;
})();

;

Progressor._customPlaceholders = {};

Progressor._customFormats = {};

exports['default'] = Progressor;
module.exports = exports['default'];