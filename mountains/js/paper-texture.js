'use strict';

Botman.PaperTexture = function( options ) {

	// Options
	this.options = $.extend( true, {}, Botman.PaperTexture.default_options, options );

	// State
	
	// Generate texture
};

Botman.PaperTexture.default_options = {
	width: 100, // x
	height: 50, // y
	depth: 100 // z
};

Botman.PaperTexture.prototype.apply_to = function( object3d ) {

	// TODO: wip
	return;
	
	var self = this;
	
	object3d.traverse( function( node ) {

		if ( !( node instanceof THREE.Mesh ) ) {

			return;
		}
		
		// Ensure there are UVs, otherwise skip mesh
		if ( typeof node.geometry.faceVertexUvs === 'undefined' || node.geometry.faceVertexUvs[0].length == 0 ) {
		
			return;
		}
		
		var south_west_vertex = node.geometry.vertices[1];
		var north_east_vertex = node.geometry.vertices[2];
		var x_offset = south_west_vertex.x;
		var x_size = north_east_vertex.x - x_offset;
		var z_offset = south_west_vertex.z;
		var z_size = z_offset - north_east_vertex.z;

		// Sides must be a power of 2, so round up to the nearest
		x_size = Math.pow( 2, Math.ceil( Math.log( x_size ) / Math.log( 2 ) ) );
		z_size = Math.pow( 2, Math.ceil( Math.log( z_size ) / Math.log( 2 ) ) );
		
		var i = 0;
		var rgb_data = new Uint8Array( x_size * z_size * 3 );
		for ( var x = 0; x < x_size; x++ ) {
		
			for ( var z = 0; z < z_size; z++ ) {

				var r = ( 1 / self.options.width ) * ( x_offset + x );
				var new_color = new THREE.Color( r, 0, 0 );
				//new_color.lerp( node.material.color, 1 - Math.random() / 3 );
				
				// RGB from 0 to 255
				rgb_data[ i * 3 ] = Math.round( new_color.r * 255 );
				rgb_data[ i * 3 + 1 ] = Math.round( new_color.g * 255 );
				rgb_data[ i * 3 + 2 ] = Math.round( new_color.b * 255 );
				i++;
			}
		}
		var texture = new THREE.DataTexture( 
			rgb_data, 
			x_size, 
			z_size, 
			THREE.RGBFormat/*,
			THREE.UnsignedByteType,
			THREE.UVMapping,
			THREE.RepeatWrapping,
			THREE.RepeatWrapping,
			THREE.LinearFilter,
			THREE.LinearFilter*/
		);
		texture.needsUpdate = true;
		node.material.map = texture;
	} );
};
