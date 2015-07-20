var Chance = require('chance');
var chance = new Chance();
var Progressor = require('./../lib/index.js');
var progressor = new Progressor({
  format: "Progress: %percent%%. Word %word%"
}, 10);

progressor.setMessage('Hello', 'word');
progressor.start();

var timer = setInterval(function () {
  progressor.setMessage(chance.word(), 'word');
  progressor.advance();
  if (progressor.isComplete()) {
    progressor.finish();
    clearInterval(timer);
  }
}, 1000);

