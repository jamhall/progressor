var Progressor = require('./../lib/index.js');

var progressor = new Progressor({
  format: " %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%",
  emptyBarChar: '-',
  progressChar: '>',
  barChar: '='
}, 10);

progressor.start();

var timer = setInterval(function () {
  progressor.advance();
  if (progressor.isComplete()) {
    progressor.finish();
    clearInterval(timer);
  }
}, 500);
