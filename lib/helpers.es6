class Helpers {
  static formatTime(seconds) {
    let timeFormats = [ [0, '< 1 sec'],
                [2, '1 sec'],
                [59 , 'secs', 1],
               [60 , '1 min'],
               [3600,  'mins', 60],
               [5400, '1 hr'],
               [86400, 'hrs', 3600],
               [129600, '1 day'],
               [604800, 'days', 86400]
           ]
           for(let format of timeFormats) {
             if(seconds >= format[0]) {
               continue;
             }
             if(2 == format.length) {
               return format[1];
             }
             return Math.ceil(seconds / format[2]) + ' ' + format[1];
         }
  }

}

module.exports = Helpers;
