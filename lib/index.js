'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Progressor = (function () {
  function Progressor(options, max) {
    _classCallCheck(this, Progressor);

    this._ = require('lodash');

    this.options = {
      barWidth: 28,
      emptyBarChar: '-',
      progressChar: '>',
      format: null,
      redrawFreq: 1
    };

    this.step = 0;
    this.stepWidth;
    this.max;
    this.startTime;
    this.percent = 0.0;
    this.lastMessagesLength = 0;
    this.formatLineCount;
    this.messages;
    this.overwrite = true;
    this.output = process.stdout;

    this.overwrite = function (message) {
      _output('overwriting');
      var lines = message.split('\n');
    };

    this.max = this._setMaxSteps(max);
    this.options = this._.merge(this._options, options);
  }

  _createClass(Progressor, [{
    key: 'getFormats',
    value: function getFormats() {
      return Progressor._formats;
    }
  }, {
    key: 'start',
    value: function start() {
      var max = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.startTime = Date.now();
      this.step = 0;
      this.percent = 0.0;
      if (null !== max) {
        this._setMaxSteps(max);
      }
      this.display();
    }
  }, {
    key: '_setMaxSteps',
    value: function _setMaxSteps(max) {
      var _max = Math.max(0, max);
      this.stepWidth = _max ? _max.toString().length : 4;
      return _max;
    }
  }, {
    key: 'display',

    /**
     * Outputs the current progress string.
     */
    value: function display() {
      var _this = this;

      this.output.write('Hello again');
      setTimeout(function () {
        _this.output.cursorTo(0);
        _this.output.write('yO');
      }, 2000);
    }
  }, {
    key: 'clearLine',
    value: function clearLine() {
      this.output.clearLine();
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
      '\n'.repeat(4);
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
      step = parseInt(step);
      if (step < this.step) {
        throw new Exception('You can\'t regress the progress bar.');
      }
      if (this.max && step > this.max) {
        this.max = step;
      }
      var previousPeriod = parseInt(this.step / this.options.redrawFreq);
      var currentPeriod = parseInt(step / this.options.redrawFreq);
      this.step = step;
      this.percent = this.max ? parseFloat(this.step / this.max) : 0;
      if (previousPeriod !== currentPeriod || this.max === step) {
        this.display();
      }
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
      if (this.step === this.max && !_overwrite) {
        return;
      }
      this.setProgress(this.max);
    }
  }], [{
    key: 'addFormat',
    value: function addFormat(name, definition) {
      this._formats[name] = definition;
    }
  }]);

  return Progressor;
})();

;

Progressor._formats = {
  'normal': ' %current%/%max% [%bar%] %percent:3s%%',
  'normal_nomax': ' %current% [%bar%]',
  'verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
  'verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
  'very_verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
  'very_verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
  'debug': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
  'debug_nomax': ' %current% [%bar%] %elapsed:6s% %memory:6s%'
};
module.exports = Progressor;
