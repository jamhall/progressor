var async = require('async');
var Progressor = require('./lib/index.js');
Progressor.setPlaceholderFormatDefinition('max', function(bar) {
  return bar.max;
});

Progressor.addFormat('test', '%bar%\nfoobar');
var numberImages = 5;
var progressor = new Progressor({
  barWidth: 50,
  format: 'test'
}, numberImages);

progressor.start();

async.timesSeries(numberImages, function(n, next){
  require('request').get('http://lorempixel.com/g/700/700/', function(err, data) {
    progressor.advance();
    next(err, data);
  });
}, function() {
  progressor.finish();
  console.log();
});
