var async = require('async');
var Progressor = require('./../lib/index.js');
var Helpers = require('./../lib/helpers.js');

Progressor.setPlaceholderFormatDefinition('memory', function(bar) {
  var i = 0;
  var memory = 100000 * i;
  var colors = i++ ? '41;37' : '44;37';
   return "\033[" + colors + "m " + Helpers.formatMemory(memory) + " \033[0m";
});

Progressor.addFormat("test", " \033[44;37m %title:-37s% \033[0m\n %current%/%max% %bar% %percent:3s%%\n 🏁  %remaining:-10s% %memory:37s%");

var progressor = new Progressor({
  format: 'test',
  barChar: "\033[32m●\033[0m",
  emptyBarChar: "\033[31m●\033[0m",
  progressChar: "\033[32m➤ \033[0m"
}, 10);

progressor.setMessage('Starting the demo... fingers crossed', 'title');

async.timesSeries(10, function(n, next){
  require('request').get('http://lorempixel.com/g/700/700/', function(err, data) {
    progressor.advance();
    progressor.setMessage('Dowloading ' + n + '...', 'title');
    next(err, data);
  });
}, function() {
  progressor.setMessage('Thanks, bye', 'title');
  progressor.finish();
});
