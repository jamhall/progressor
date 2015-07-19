var Progressor = (function(options, max) {
    let _ = require('lodash');

    let _options = _.merge({
        barWidth: 28,
        emptyBarChar: '-',
        progressChar: '>',
        format: null,
        redrawFreq: 1
    }, options);

    let _output;
    let _step = 0;
    let _stepWidth;

    let _setMaxSteps = (max) => {
        let _max = Math.max(0, max);
        _stepWidth = _max ? _max.toString().length : 4;
        return _max;
    }

    let _max = _setMaxSteps(max);

    let _startTime;
    let _percent = 0.0;
    let _lastMessagesLength = 0;
    let _formatLineCount;
    let _messages;
    let _overwrite = true;

    let _formats = {
            'normal' : ' %current%/%max% [%bar%] %percent:3s%%',
            'normal_nomax' : ' %current% [%bar%]',
            'verbose' : ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%',
            'verbose_nomax' : ' %current% [%bar%] %elapsed:6s%',
            'very_verbose' : ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%',
            'very_verbose_nomax' : ' %current% [%bar%] %elapsed:6s%',
            'debug' : ' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%',
            'debug_nomax' : ' %current% [%bar%] %elapsed:6s% %memory:6s%',
    }

    let overwrite = (message) => {
      _output('overwriting');
      let lines = message.split("\n");
      
    }


  return new class {
      addFormat(name, format) {
       _formats[name] = format;
      }
      getFormats() {
        return _formats;
      }
      setOutput(output) {
       _output = output;
      }
      start(max = null) {
        _startTime = Date.now();
        _step = 0;
        _percent = 0.0;
        if (null !== max) {
            _setMaxSteps(max);
        }
        this.display();
      }

      /**
       * Outputs the current progress string.
       */
      display() {
        _output('Hello again');

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
       this.setProgress(_step + step );
      }

      /**
       * Sets the current progress
       */
      setProgress(step) {
        step = parseInt(step);
        if (step < _step) {
            throw new Exception('You can\'t regress the progress bar.');
        }
        if (_max && step > _max) {
            _max = step;
        }
        let prevPeriod = parseInt(_step / _options.redrawFreq);
        let currPeriod =parseInt(step / _options.redrawFreq);
        _step = step;
        _percent = _max ? parseFloat(_step / _max) : 0;
        if (prevPeriod !== currPeriod || _max === step) {
            this.display();
        }
      }

      /**
       * Finishes the progress output.
       */
      finish() {
        if (!_max) {
          _max = _step;
        }
        if(_step === _max && !_overwrite) {
          return;
        }
        this.setProgress(_max);
      }
  }()
})


module.exports = Progressor;
