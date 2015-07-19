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

	var self = this;
	var size = this.options.width * this.options.depth;
	
	object3d.traverse( function( node ) {

		if ( !( node instanceof THREE.Mesh ) ) {

			return;
		}
		
		// Ensure there are UVs, otherwise skip mesh
		if ( typeof node.geometry.faceVertexUvs === 'undefined' || node.geometry.faceVertexUvs[0].length == 0 ) {
		
			return;
		}
		
		var rgba_data = new Uint8Array( size * 3 );
		for( var i = 0; i < size; i++ ){

			var new_color = new THREE.Color( 0xAAAAAA );
			new_color.lerp( node.material.color, 1 - Math.random() / 2 );
			
			// RGB from 0 to 255
			var grey = 255;
			rgba_data[ i * 3 ] = Math.round( new_color.r * 255 );
			rgba_data[ i * 3 + 1 ] = Math.round( new_color.g * 255 );
			rgba_data[ i * 3 + 2 ] = Math.round( new_color.b * 255 );
		}
		var texture = new THREE.DataTexture( 
			rgba_data, 
			self.options.width, 
			self.options.depth, 
			THREE.RGBFormat
			/*
			THREE.UVMapping,
			THREE.ClampToEdgeWrapping,
			THREE.ClampToEdgeWrapping,
			THREE.LinearFilter,
			THREE.LinearFilter
			*/
		);
		texture.needsUpdate = true;
		node.material.map = texture;
	} );
};
