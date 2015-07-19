'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Helpers = (function () {
  function Helpers() {
    _classCallCheck(this, Helpers);
  }

  _createClass(Helpers, null, [{
    key: 'formatTime',
    value: function formatTime(seconds) {
      var timeFormats = [[0, '< 1 sec'], [2, '1 sec'], [59, 'secs', 1], [60, '1 min'], [3600, 'mins', 60], [5400, '1 hr'], [86400, 'hrs', 3600], [129600, '1 day'], [604800, 'days', 86400]];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = timeFormats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var format = _step.value;

          if (seconds >= format[0]) {
            continue;
          }
          if (2 == format.length) {
            return format[1];
          }
          return Math.ceil(seconds / format[2]) + ' ' + format[1];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'formatMemory',
    value: function formatMemory(memory) {
      var sprintf = require('sprintf').sprintf;
      if (memory >= 1024 * 1024 * 1024) {
        return sprintf('%.1f GiB', memory / 1024 / 1024 / 1024);
      }
      if (memory >= 1024 * 1024) {
        return sprintf('%.1f MiB', memory / 1024 / 1024);
      }
      if (memory >= 1024) {
        return sprintf('%d KiB', memory / 1024);
      }
      return sprintf('%d B', memory);
    }
  }, {
    key: 'strlenWithoutDecoration',
    value: function strlenWithoutDecoration(string) {
      var pattern = /\033\[[^m]*m/g;
      return string.replace(pattern, '\n').length;
    }
  }]);

  return Helpers;
})();

exports['default'] = Helpers;
module.exports = exports['default'];