'use strict';

Botman.Util = {}; // Singleton

/**
*	Returns a random item from the given array.
*/
Botman.Util.random_element = function( array ) {

	return array[Math.floor( Math.random() * array.length )];
}

/**
*	Returns a random integer number between min and max, inclusive.
*/
Botman.Util.random_int = function( min, max ) {

	return Math.floor( Math.random() * ( max - min + 1 ) + min );
};

/**
*	Returns a random value (float) around 1 with an approximate normal distribution.
*	See: http://stackoverflow.com/a/20161247/127352 and http://jsfiddle.net/tvt5K/102/
*/
Botman.Util.normally_distributed_random = function() {

	// A higher divisor creates more of a central peak. Dividing by 3 seems to make a nice looking bell curve.
	return ( ( Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() ) ) / 3;
};

Botman.Util.diamond_square = function( side_length, seed, variation ) {

	//
	// Ensure side_length is a power of 2 + 1
	var base = side_length - 1;
	if ( ( base == 0 ) || ( ( base & ( base - 1 ) ) != 0 ) ) {
	
		alert( 'Invalid height map size' );
		return new Array();
	}

	//
	// Create empty map
	var map = new Array( side_length );
	for ( var i = 0; i < side_length; i++ ) {
	
		map[i] = new Array( side_length );
	}
	
	//
	// Seed initial corners
	map[0][0] = seed += ( ( Math.random() * 2 * variation ) - variation );
	map[0][side_length - 1] = seed += ( ( Math.random() * 2 * variation ) - variation );
	map[side_length - 1][0] = seed += ( ( Math.random() * 2 * variation ) - variation );
	map[side_length - 1][side_length - 1] = seed += ( ( Math.random() * 2 * variation ) - variation );
	
	//
	// Start processing
	for ( var step_length = side_length - 1; step_length >= 2; step_length /= 2, variation /= 2 ) {
	
		var half_length = step_length / 2;
		
		//
		// Square step
		for ( var x = 0; x < side_length - 1; x += step_length ) {

			for ( var y = 0; y < side_length - 1; y += step_length ) {
		
				var tr = ( map[x + step_length] == undefined ) ? seed : map[x + step_length][y];
				var bl = ( map[x][y + step_length] == undefined ) ? seed : map[x][y + step_length];
				var br = ( map[x + step_length] == undefined || map[x + step_length][y + step_length] == undefined ) ? seed : map[x + step_length][y + step_length];
				
				var average = (
					map[x][y] + // top-left
					tr + // top-right
					bl + // bottom-left
					br // bottom-right
				);
				average /= 4;
				
				// smoothing (in range of += variation );
				average += ( ( Math.random() * 2 * variation ) - variation );
				//average += ( Math.random() * variation );
				
				// set centre point to be the average, plus random offset
				map[x + half_length][y + half_length] = average;
			}
		}
		
		//
		// Diamond step
		for( var x = 0; x < side_length; x += half_length ) {
		
			for( var y = ( x + half_length) % step_length; y < side_length; y += step_length ) {
			
				var average = (
					map[x][( y - half_length + side_length - 1 ) % ( side_length - 1 )] + // top
					map[x][( y + half_length ) % ( side_length - 1 )] + // bottom
					map[( x + half_length ) % ( side_length - 1 )][y] + // right
					map[( x - half_length + side_length - 1 ) % ( side_length - 1 )][y] // left
				);
				average /= 4;
				average += ( ( Math.random() * 2 * variation ) - variation );
				//average += ( Math.random() * variation );
				
				// set centre point to be the average, plus random offset
				map[x][y] = average;
			}
		}
	}
	
	return map;
};
