class Progressor {

  constructor(options, max) {
    this._ = require('lodash');

    this.options = {
      barWidth: 28,
      emptyBarChar: '-',
      progressChar: '>',
      format: null,
      redrawFreq: 1
    }

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

    this.overwrite = (message) => {
      _output('overwriting');
      let lines = message.split("\n");
    }

    this.max = this._setMaxSteps(max);
    this.options = this._.merge(this._options, options);
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

  _setMaxSteps(max){
    let _max = Math.max(0, max);
    this.stepWidth = _max ? _max.toString()
      .length : 4;
    return _max;
  }

  /**
   * Outputs the current progress string.
   */
  display() {
    this.output.write('Hello again');
    setTimeout(() =>{
      this.output.cursorTo(0);
      this.output.write('yO')
    },2000);
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
    if (previousPeriod !== currentPeriod || this.max === step) {
      this.display();
    }
  }

  /**
   * Finishes the progress output.
   */
  finish() {
    if (!this.max) {
      this.max = this.step;
    }
    if (this.step === this.max && !_overwrite) {
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
module.exports = Progressor;
