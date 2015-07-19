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
  barWidth: 50,
  format: 'test',
  barChar: "\033[32m●\033[0m",
  emptyBarChar: "\033[31m●\033[0m",
  progressChar: "\033[32m➤ \033[0m"
}, 15);

progressor.setMessage('Starting the demo... fingers crossed', 'title');
progressor.start();
progressor.setMessage('Looks good to me...', 'title');
progressor.advance(4);
progressor.setMessage('Thanks, bye', 'title');
progressor.finish();
