# Progressor
### Nice progress bars for your nodejs based console apps.

![Image of Progressor](https://raw.githubusercontent.com/jamhall/progressor/master/examples/advanced.gif)

### Options

 - `barWidth` The width of the progress bar (defaults to `28`)
 - `emptyBarChar` Empty bar character (defaults to `-`)
 - `progressChar` Progress character for the bar (defaults to `>`)
 - `redrawFreq` Frequency to update the progress bar(defaults to `1`. Useful is you have a lot of steps)
 - `overwrite`  Overwrite the console text on every refresh (defaults to `true`) 
 - `barChar` Bar character for the bar (defaults to `=`)
 - `beforeNewlines` Insert a number of new lines before outputting the progress bar(defaults to `null` and called on `start`)
 -  `afterNewlines` Insert a number of new lines after outputting the progress bar (defaults to `null` and called on `finish`)

 - `format` The chosen format(defaults to `normal`). There are 8 out-of-the-box formats to choose from:
	 - normal: ` %current%/%max% [%bar%] %percent:3s%%'`
	 - normal_nomax(no max steps given) is given::` %current% [%bar%]`
	 - verbose: ` %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%`
	 - verbose_nomax(no max steps given):  ` %current% [%bar%] %elapsed:6s%`
	 - very_verbose: ` %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%`
	 - very_verbose_no_max(no max steps given): ` %current% [%bar%] %elapsed:6s`
	 - debug: `%current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%`
	 - debug_nomax (no max steps given) : ` %current% [%bar%] %elapsed:6s% %memory:6s%'` 
