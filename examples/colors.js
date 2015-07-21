require('colors');
var Progressor = require('./../lib/index.js');
Progressor.addFormat('minimal', "Progress: (%remaining_steps% steps remaining): " + "%percent%%".red.bold);
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


