'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Progressor = function Progressor(options, max) {
  var _ = require('lodash');

  var _options = _.merge({
    barWidth: 28,
    emptyBarChar: '-',
    progressChar: '>',
    format: null,
    redrawFreq: 1
  }, options);

  var _output = undefined;
  var _step = 0;
  var _stepWidth = undefined;

  var _setMaxSteps = function _setMaxSteps(max) {
    var _max = Math.max(0, max);
    _stepWidth = _max ? _max.toString().length : 4;
    return _max;
  };

  var _max = _setMaxSteps(max);

  var _startTime = undefined;
  var _percent = 0.0;
  var _lastMessagesLength = 0;
  var _formatLineCount = undefined;
  var _messages = undefined;
  var _overwrite = true;

  var _formats = {
    'normal': ' %current%/%max% [%bar%] %percent:3s%%',
    'normal_nomax': ' %current% [%bar%]',
    'verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
    'verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
    'very_verbose': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
    'very_verbose_nomax': ' %current% [%bar%] %elapsed:6s%',
    'debug': ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
    'debug_nomax': ' %current% [%bar%] %elapsed:6s% %memory:6s%'
  };

  var overwrite = function overwrite(message) {
    _output('overwriting');
    var lines = message.split('\n');
  };

  return new ((function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _createClass(_class, [{
      key: 'addFormat',
      value: function addFormat(name, format) {
        _formats[name] = format;
      }
    }, {
      key: 'getFormats',
      value: function getFormats() {
        return _formats;
      }
    }, {
      key: 'setOutput',
      value: function setOutput(output) {
        _output = output;
      }
    }, {
      key: 'start',
      value: function start() {
        var max = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _startTime = Date.now();
        _step = 0;
        _percent = 0.0;
        if (null !== max) {
          _setMaxSteps(max);
        }
        this.display();
      }
    }, {
      key: 'display',

      /**
       * Outputs the current progress string.
       */
      value: function display() {
        _output('Hello again');
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

        this.setProgress(_step + step);
      }
    }, {
      key: 'setProgress',

      /**
       * Sets the current progress
       */
      value: function setProgress(step) {
        step = parseInt(step);
        if (step < _step) {
          throw new Exception('You can\'t regress the progress bar.');
        }
        if (_max && step > _max) {
          _max = step;
        }
        var prevPeriod = parseInt(_step / _options.redrawFreq);
        var currPeriod = parseInt(step / _options.redrawFreq);
        _step = step;
        _percent = _max ? parseFloat(_step / _max) : 0;
        if (prevPeriod !== currPeriod || _max === step) {
          this.display();
        }
      }
    }, {
      key: 'finish',

      /**
       * Finishes the progress output.
       */
      value: function finish() {
        if (!_max) {
          _max = _step;
        }
        if (_step === _max && !_overwrite) {
          return;
        }
        this.setProgress(_max);
      }
    }]);

    return _class;
  })())();
};

module.exports = Progressor;
