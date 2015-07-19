'use strict';

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

var Progressor = (function () {
   function Progressor(options, max) {
      _classCallCheck(this, Progressor);

      this._ = require('lodash');

      this.options = {
         barWidth: 28,
         emptyBarChar: '-',
         progressChar: '>',
         redrawFreq: 1,
         barChar: null,
         format: 'debug'
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
      this.formatters = null;
      this.overwrite = function (message) {
         _output('overwriting');
         var lines = message.split('\n');
      };

      this.max = this._setMaxSteps(max);
      this.options = this._.merge(this.options, options);
      this.format = Progressor._formats[this.options.format];
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

         this.update(this.format.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/g, function (matches, part1, part2) {
            var formatter = _this.getPlaceholderFormatterDefinition(part1);
            if (formatter) {
               return formatter.call();
            };
            return matches;
         }));
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
         console.log(message);
      }
   }, {
      key: 'getBarCharacter',
      value: function getBarCharacter() {
         if (null === this.options.barChar) {
            return this.max ? '=' : this.options.emptyBarChar;
         }
         return this.options.barChar;
      }
   }, {
      key: 'initPlaceholders',
      value: function initPlaceholders() {
         var _this2 = this;

         return {
            'bar': function bar() {
               var completeBars = Math.floor(_this2.max > 0 ? _this2.percent * _this2.options.barWidth : _this2.step % _this2.options.barWidth);
               var display = _this2.getBarCharacter().repeat(completeBars);
               if (completeBars < _this2.options.barWidth) {
                  var emptyBars = _this2.options.barWidth - completeBars - _helpers2['default'].strlenWithoutDecoration(_this2.options.progressChar);
                  display = display + _this2.options.progressChar + _this2.options.emptyBarChar.repeat(emptyBars);
               }
               return display;
            },
            'elapsed': function elapsed() {
               var seconds = (Date.now() - _this2.startTime) / 1000;
               return _helpers2['default'].formatTime(seconds);
            },
            'max': function max() {
               return _this2.max;
            },
            'percent': function percent() {
               return Math.floor(_this2.percent * 100);
            },
            'estimated': function estimated() {
               var estimated = undefined;
               if (!_this2.max) {
                  throw new Error('Unable to display the estimated time if the maximum number of steps is not set.');
               }
               if (!_this2.step) {
                  estimated = 0;
               } else {
                  estimated = Math.round((Date.now() - _this2.startTime) / 1000 / _this2.step * _this2.max);
               }
               return _helpers2['default'].formatTime(estimated);
            },
            'current': function current() {
               return (0, _pad2['default'])(_this2.step.toString(), _this2.options.stepWidth, ' ');
            },
            'memory': function memory() {
               var memoryUsage = process.memoryUsage();
               return _helpers2['default'].formatMemory(memoryUsage.rss);
            },
            'remaining': function remaining() {
               var remaining = undefined;
               if (!_this2._max) {
                  throw new Error('Unable to display the remaining time if the maximum number of steps is not set.');
               }
               if (!_this2.step) {
                  remaining = 0;
               } else {
                  remaining = Math.round((Date.now() - _this2.startTime) / 1000 / _this2.step * (_this2.max - _this2.steps));
               }
               return _helpers2['default'].formatTime(remaining);
            }
         };
      }
   }, {
      key: 'getPlaceholderFormatterDefinition',
      value: function getPlaceholderFormatterDefinition(formatter) {
         if (!this.formatters) {
            console.log('Initializing formatters');
            this.formatters = this.initPlaceholders();
         }
         return this.formatters.hasOwnProperty(formatter) ? this.formatters[formatter] : null;
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
         if (this.step === this.max && !this.overwrite) {
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
exports['default'] = Progressor;
module.exports = exports['default'];