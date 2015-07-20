var Progressor = require('./../lib/index.js');
Progressor.addFormat('minimal', "Progress: \033[0;31m %percent%%\033[0m");

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

