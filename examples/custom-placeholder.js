var Progressor = require('./../lib/index.js');
Progressor.addFormat('minimal', "Progress: (%remaining_steps% steps remaining) \033[0;31m %percent%%\033[0m");
Progressor.setPlaceholderFormatDefinition('remaining_steps', function (bar) {
  return bar.max - bar.step;
});
var progressor = new Progressor({
  format: 'minimal'
}, 10);

progressor.start();

var timer = setInterval(function () {
  progressor.advance();
  if (progressor.isComplete()) {
    progressor.finish();
    clearInterval(timer);
  }
}, 1000);


