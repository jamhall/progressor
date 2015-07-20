var async = require('async');
var Progressor = require('./../lib/index.js');

var numberImages = 10;
var progressor = new Progressor({
  format: 'debug'
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
