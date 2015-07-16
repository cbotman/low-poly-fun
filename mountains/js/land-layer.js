'use strict';

Botman.LandLayer = function( options ) {

	// Options
	options = $.extend( true, {}, Botman.LandLayer.default_options, options );

	// State
	this._color_map = options.color_map;
	this._tile_width_x = options.tile_width_x;
	this._tile_width_z = options.tile_width_z;
	this._surface_points = [];
	this._highest_point = 0;
	this._land = null;
};

Botman.LandLayer.default_options = {
	tile_width_x: 10,
	tile_width_z: 10,
	// Colours for surface. The row is deterimed by each face's average height, then a 
	// column is selected randomly to create variation. (Not really using, as doesn't look great)
	color_map: [[0xD8D6A3]]
};

Botman.LandLayer.prototype.compute_surface_points = function( desired_highest_point ) {

	/**
	 * Settled on a 5 step process.
	 * - generate a set of point susing diamond square, as I like the shapes this gives more than perlin, so far
	 * - multiply all the points exponentially, to effectively stretch them out and make the higher points higher, relatively speaking
	 * - reduce all the points by the minimum, so the lowest point is 0
	 * - scale all the points so they are within a desired range of 0 to X.
	 * - finally, smooth out any spikes
	 */

	var points = Botman.Util.diamond_square( 17, 0, 6 );

	// Trim off the edge points as they tend to be spikes with diamond square
	var trimmed_points = [];
	for ( var x = 1; x < points.length - 1; x++ ) {

		trimmed_points.push( [] );
		for ( var y = 1; y < points[x].length - 1; y++ ) {
		
			trimmed_points[x - 1].push( points[x - 1][y - 1] );
		}
	}
	points = trimmed_points;
	
	/*
	// reference points for debugging
	points = [
		[3, 5, 10],
		[2, 5, 10],
		[2, 6, 11]
	];
	*/

	// Multiply each point to stretch it out
	var min = -1;
	for ( var x = 0; x < points.length; x++ ) {

		for ( var y = 0; y < points[x].length; y++ ) {

			points[x][y] = Math.abs( points[x][y] ); // Otherwise next step can run into trouble: http://stackoverflow.com/q/14575697/127352
			points[x][y] = Math.pow( points[x][y], 2.4 ); // Higher exponent stretches things out further
			if ( points[x][y] < min || min == -1 ) {
		
				min = points[x][y];
			}
			if ( points[x][y] > this._highest_point ) {
			
				this._highest_point = points[x][y];
			}
		}
	}
	//console.log(points);

	// Lower all points by their minimum and scale to be between 0 and X
	this._highest_point -= min;
	var scale = ( desired_highest_point / this._highest_point );
	this._highest_point *= scale;
	for ( var x = 0; x < points.length; x++ ) {

		for ( var y = 0; y < points[x].length; y++ ) {

			points[x][y] -= min;
			points[x][y] *= scale;
		}
	}

	// Smooth out any crazy spikes.
	var smoothed_points = [];
	this._highest_point = 0;
	for ( var x = 0; x < points.length; x++ ) {

		smoothed_points.push( [] );
		for ( var y = 0; y < points[x].length; y++ ) {

			var max_difference = 0;
			for ( var deltaX = x - 1; deltaX <= x + 1; deltaX++ ) {

				for ( var deltaY = y - 1; deltaY <= y + 1; deltaY++ ) {

					var out_of_bounds = (
						deltaX < 0 || 
						deltaY < 0 ||
						deltaX >= points.length || 
						deltaY >= points[deltaX].length ||
						( deltaX == x && deltaY == y )
					);
					if ( out_of_bounds ) {
						
						continue;
					}
					var difference = points[x][y] - points[deltaX][deltaY];
					if ( difference > max_difference ) {
					
						max_difference = difference;
					}
				}
			}
			var revised_point = points[x][y];
			if ( max_difference > ( revised_point / 2 ) ) {

				revised_point *= 0.5;
			}
			if ( revised_point > this._highest_point ) {
			
				this._highest_point = revised_point;
			}
			smoothed_points[x].push( revised_point );
		}
	}
	points = smoothed_points;

	// Sanity check. If less than say X% of points are at least 50% of the target height, restart.
	var passes = 0;
	var pass_mark = Math.ceil( ( points.length * points[0].length ) / 100 ) * 2;
	for ( var x = 0; x < points.length; x++ ) {

		for ( var y = 0; y < points[x].length; y++ ) {

			if ( points[x][y] > ( desired_highest_point / 2 ) ) {

				passes++;
			}
		}
	}
	if ( passes <= pass_mark ) {

		//console.log( 'recalc' );
		this.compute_surface_points( desired_highest_point );
	}
	else {

		this._surface_points = points;
	}
};

Botman.LandLayer.prototype.get_width_x = function() {

	// -1 because there's n + 1 data points for n tiles
	return ( ( this._surface_points.length - 1 ) * this._tile_width_x );
};

Botman.LandLayer.prototype.get_center_x = function() {

	return this.get_width_x() / 2;
};

Botman.LandLayer.prototype.get_width_z = function() {

	if ( this._surface_points.length == 0 ) {

		return 0;
	}
	// -1 because there's n + 1 data points for n tiles
	return ( ( this._surface_points[0].length - 1 ) * this._tile_width_z );
};

Botman.LandLayer.prototype.get_center_z = function() {

	return this.get_width_z() / 2;
};

Botman.LandLayer.prototype.get_land = function() {

	return this._land;
};

Botman.LandLayer.prototype.get_highest_point = function() {

	return this._highest_point;
};

Botman.LandLayer.prototype.draw = function() {

	var land = new THREE.Object3D();

	//
	// Draw surface terrain
	var material = new THREE.MeshLambertMaterial( { 
		color: 0xD8D6A3, 
		shading: THREE.FlatShading,
		vertexColors: THREE.FaceColors
	} );

	var tile_width_x = this._tile_width_x;
	var tile_width_z = this._tile_width_z;

	for ( var x = 0; x < this._surface_points.length - 1; x++ ) {

		for ( var y = 0; y < this._surface_points[x].length - 1; y++ ) {

			var geometry = new THREE.Geometry();

			var west_x = x * tile_width_x;
			var east_x = west_x + tile_width_x;
			var north_z = y * tile_width_z;
			var south_z = north_z + tile_width_z;

			var north_west_y = this._surface_points[x][y];
			var south_west_y = this._surface_points[x][y + 1];
			var north_east_y = this._surface_points[x + 1][y];
			var south_east_y = this._surface_points[x + 1][y + 1];

			geometry.vertices.push( new THREE.Vector3( west_x, north_west_y, north_z ) ); // north-west
			geometry.vertices.push( new THREE.Vector3( west_x, south_west_y, south_z ) ); // south-west
			geometry.vertices.push( new THREE.Vector3( east_x, north_east_y, north_z ) ); // north-east
			geometry.vertices.push( new THREE.Vector3( east_x, south_east_y, south_z ) ); // south-east
			geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // sw, ne, nw
			geometry.faces.push( new THREE.Face3( 1, 3, 2 ) ); // sw, se, ne
			geometry.computeFaceNormals();
			
			//this._map_surface_color( geometry.faces[0], ( south_west_y + north_east_y + north_west_y ) / 3 );
			//this._map_surface_color( geometry.faces[1], ( south_west_y + south_east_y + north_east_y ) / 3 );
			
			this._map_surface_color( geometry.faces[0], Math.max( south_west_y, north_east_y, north_west_y ) );
			this._map_surface_color( geometry.faces[1], Math.max( south_west_y, south_east_y, north_east_y ) );

			var square_mesh = new THREE.Mesh( geometry, material );
			square_mesh.receiveShadow = true;
			//square_mesh.castShadow = true;
			land.add( square_mesh );
		}
	}
	
	//
	// Draw sides

	// X-
	var points = this._surface_points[0];
	var side = this._drawSide( points, this._highest_point, this._tile_width_z );
	side.rotation.y = 270 * Math.PI / 180; // Rotate by X degrees
	side.position.z += this.get_center_z(); // Move into position
	land.add( side );

	// X+
	var points = this._surface_points[this._surface_points.length - 1];
	points = points.slice().reverse(); // Flip points. Need to slice so original points data isn't altered
	side = this._drawSide( points, this._highest_point, this._tile_width_z );
	side.rotation.y = 90 * Math.PI / 180; // Rotate by X degrees
	side.position.x += this.get_width_x(); // Move into position
	side.position.z += this.get_center_z(); 
	land.add( side );

	// Z-
	points = [];
	// Iterate array backwards so points are in required order
	for ( var i = this._surface_points.length - 1; i >= 0; i-- ) {

		points.push( this._surface_points[i][0] );
	}
	side = this._drawSide( points, this._highest_point, this._tile_width_x );
	side.rotation.y = 180 * Math.PI / 180; // Rotate by X degrees
	side.position.x += this.get_center_x(); // Move into position
	land.add( side );
	
	// Z+
	points = [];
	for ( var i = 0; i < this._surface_points.length; i++ ) {
	
		points.push( this._surface_points[i][this._surface_points[i].length - 1] );
	}
	side = this._drawSide( points, this._highest_point, this._tile_width_x );
	side.rotation.y = 0 * Math.PI / 180; // Rotate by X degrees. In this case, none needed.
	side.position.x += this.get_center_x(); // Move into position
	side.position.z += this.get_width_z();
	land.add( side );
	
	//
	// Draw base
	//var paper_texture = new THREE.ImageUtils.loadTexture( 'images/paper-scan.png' );
	var darkSideMaterial = new THREE.MeshLambertMaterial( { 
		color: 0x614126, 
		shading: THREE.FlatShading
		//map: paper_texture
	} );
	var geometry = new THREE.PlaneBufferGeometry( this.get_width_x(), this.get_width_z(), 1 );
	var floor = new THREE.Mesh( geometry, darkSideMaterial );
	floor.rotation.x = Math.PI / 2;
	floor.position.x = this.get_center_x();
	floor.position.z = this.get_center_z();
	floor.position.y = -this._highest_point / 2;
	land.add( floor );

	// Update reference
	this._land = land;

	return land;
};

Botman.LandLayer.prototype.get_color_map = function() {

	return this._color_map;
};

Botman.LandLayer.prototype.get_color_map_index = function( height ) {

	var index = this._color_map.length - 1;
	index -= Math.floor( height / ( ( this._highest_point + 1 ) / this._color_map.length ) );
	return index;
};

Botman.LandLayer.prototype._map_surface_color = function( face, height ) {

	var colors = this._color_map[this.get_color_map_index( height )];
	face.color.setHex( Botman.Util.random_element( colors ) );
};

Botman.LandLayer.prototype._drawSide = function( points, global_max_point, tile_width ) {

	var side = new THREE.Object3D();
	
	var lightSideMaterial = new THREE.MeshLambertMaterial( { 
		color: 0x8E5E39, 
		shading: THREE.FlatShading
	} );
	var darkSideMaterial = new THREE.MeshLambertMaterial( { 
		color: 0x614126, 
		shading: THREE.FlatShading
	} );
	
	// Offset all the points so the center point is in the middle
	var left_offset = ( points.length - 1 ) * tile_width / 2 * -1;
	for ( var i = 0; i < points.length - 1; i++ ) {
		
		//
		// Draw top soil layer
		
		var left_x = left_offset + ( tile_width * i );
		var right_x = left_x + tile_width;
		var top_left_y = points[i];
		var top_right_y = points[i + 1];
		
		var middle_left_y = ( top_left_y - global_max_point ) / 3;
		var middle_right_y = ( top_right_y - global_max_point ) / 3;
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( left_x, middle_left_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, top_right_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( left_x, top_left_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, middle_right_y, 0 ) );
		geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
		geometry.faces.push( new THREE.Face3( 0, 3, 1 ) );
		geometry.computeFaceNormals();

		var squareMesh = new THREE.Mesh( geometry, lightSideMaterial );
		side.add( squareMesh );
		
		//
		// Draw bottom soil layer

		var bottom_y = -global_max_point / 2;
		
		geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( left_x, bottom_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, middle_right_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( left_x, middle_left_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, bottom_y, 0 ) );
		geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
		geometry.faces.push( new THREE.Face3( 0, 3, 1 ) );
		geometry.computeFaceNormals();

		squareMesh = new THREE.Mesh( geometry, darkSideMaterial );
		side.add( squareMesh );

	}
	
	return side;
};

