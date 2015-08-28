'use strict';

/**
*	Overwrites Math.random to be a fixed seed
*	Original source: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
*/

Math.seed = 2;

Math.random = function() {

    var max = 1;
    var min = 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}
