var Progressor = require('./../lib/index.js');

var progressor = new Progressor({
  format: 'debug_nomax'
});

progressor.start();

var timer = setInterval(function () {
  progressor.advance();
  if (progressor.isComplete()) {
    progressor.finish();
    clearInterval(timer);
  }
}, 500);
