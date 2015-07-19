import Helpers from './helpers'
import pad from 'pad';

class Progressor {

   constructor(options, max) {
      this._ = require('lodash');

      this.options = {
         barWidth: 28,
         emptyBarChar: '-',
         progressChar: '>',
         redrawFreq: 1,
         format: 'debug'
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
      this.update(this.format.replace(/%([a-z\-_]+)(?:\:([^%]+))?%/g, (matches, part1, part2) => {
        var formatter = this.getPlaceholderFormatterDefinition(part1);
        if(formatter){
          return formatter.call();
        };
        return matches;
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
         if (previousPeriod !== currentPeriod || this.max === step) {
            this.display();
         }
      }
   /**
    * Updates the display
    */
   update(message) {
     console.log('Message', message);

   }
   /**
    *
    */
   initPlaceholders() {
     return {
       'elapsed': () => {
         let seconds = (Date.now()  - this.startTime) / 1000;
         return Helpers.formatTime(seconds);
       },
       'max': () => {
                return this.max;
        },
        'percent' : () =>  {
                return Math.floor(this.percent * 100);
        },
        'estimated' : () => {
                let estimated;
                if (!this.max) {
                    throw new Exception('Unable to display the estimated time if the maximum number of steps is not set.');
                }
                if (!this.step) {
                    estimated = 0;
                } else {
                   estimated = Math.round((Date.now() - this.startTime) / this.step * this.max);
                }
                return Helpers.formatTime(estimated);
        },
        'current': () => {
          return pad(this.step.toString(), this.options.stepWidth, ' ');
        },
        'memory': () => {
          var memoryUsage = process.memoryUsage();
          return Helpers.formatMemory(memoryUsage.rss);
        }
     }
   }
   getPlaceholderFormatterDefinition(formatter) {
     if(!this.formatters) {
       console.log('Initializing formatters');
       this.formatters = this.initPlaceholders();
     }
     return this.formatters.hasOwnProperty(formatter) ? this.formatters[formatter] : null;
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
