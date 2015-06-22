
Botman.LandLayer = function( options ) {

	// Options
	this.options = $.extend( true, {}, Botman.LandLayer.default_options, options );

	// State
	this.surface_points = [];
};

Botman.LandLayer.default_options = {
	tile_width_x: 10,
	tile_width_z: 10
};

Botman.LandLayer.prototype.compute_surface_points = function() {

	var points = Botman.Util.diamond_square( 17, 0, 7 );
	var min = 999;
	for ( var x = 0; x < points.length; x++ ) {

		for ( var y = 0; y < points[x].length; y++ ) {

			points[x][y] = Math.abs( points[x][y] ) * 4; // multiplication here amplifies features
			if ( points[x][y] < min ) {
		
				min = points[x][y];
			}
		}
	}
	//console.log(points);

	// Lower all points by their minimum
	for ( var x = 0; x < points.length; x++ ) {

		for ( var y = 0; y < points[x].length; y++ ) {

			points[x][y] -= min;
		}
	}

	// reference points for debugging
	points = [
				/*X-*/
			[15, 20, 40],
	/*Z-*/	[10, 20, 40],	/*Z+*/
			[11, 22, 43]
				/*X+*/
	];
	console.log(points);
	this.surface_points = points;
};

Botman.LandLayer.prototype.get_width_x = function() {

	// -1 because the there's an extra data point
	return ( ( this.surface_points.length - 1 ) * this.options.tile_width_x );
};

Botman.LandLayer.prototype.get_center_x = function() {

	return this.get_width_x() / 2;
};

Botman.LandLayer.prototype.get_width_z = function() {

	if ( this.surface_points.length == 0 ) {

		return 0;
	}
	// -1 because the there's an extra data point
	return ( ( this.surface_points[0].length - 1 ) * this.options.tile_width_z );
};

Botman.LandLayer.prototype.get_center_z = function() {

	return this.get_width_z() / 2;
};

Botman.LandLayer.prototype.draw = function() {

	var land = new THREE.Object3D();

	//
	// Draw surface terrain
	
	var material = new THREE.MeshLambertMaterial( { 
		color: 0xD8D6A3, 
		shading: THREE.FlatShading 
	} );

	var tile_width_x = this.options.tile_width_x;
	var tile_width_z = this.options.tile_width_z;

	for ( var x = 0; x < this.surface_points.length - 1; x++ ) {

		for ( var y = 0; y < this.surface_points[x].length - 1; y++ ) {

			var geometry = new THREE.Geometry();

			var west_x = x * tile_width_x;
			var east_x = west_x + tile_width_x;
			var north_z = y * tile_width_z;
			var south_z = north_z + tile_width_z;

			var north_west_y = this.surface_points[x][y];
			var south_west_y = this.surface_points[x][y + 1];
			var north_east_y = this.surface_points[x + 1][y];
			var south_east_y = this.surface_points[x + 1][y + 1];

			geometry.vertices.push( new THREE.Vector3( west_x, north_west_y, north_z ) ); // north-west
			geometry.vertices.push( new THREE.Vector3( west_x, south_west_y, south_z ) ); // south-west
			geometry.vertices.push( new THREE.Vector3( east_x, north_east_y, north_z ) ); // north-east
			geometry.vertices.push( new THREE.Vector3( east_x, south_east_y, south_z ) ); // south-east
			geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // sw, ne, nw
			geometry.faces.push( new THREE.Face3( 1, 3, 2 ) ); // sw, se, ne
			geometry.computeFaceNormals();

			var square_mesh = new THREE.Mesh( geometry, material );
			land.add( square_mesh );
		}
	}
	
	//
	// Draw sides

	// X-
	var points = this.surface_points[0];
	var side = this._drawSide( points, this.options.tile_width_z );
	side.rotation.y = 270 * Math.PI / 180; // Rotate by X degrees
	side.position.z += this.get_center_z(); // Move into position
	land.add( side );

	// X+
	var points = this.surface_points[this.surface_points.length - 1];
	points = points.slice().reverse(); // Flip points. Need to slide so original points data isn't altered
	side = this._drawSide( points, this.options.tile_width_z );
	side.rotation.y = 90 * Math.PI / 180; // Rotate by X degrees
	side.position.x += this.get_width_x(); // Move into position
	side.position.z += this.get_center_z(); 
	land.add( side );

	// Z-
	points = [];
	// Iterate array backwards so points are in required order
	for ( var i = this.surface_points.length - 1; i >= 0; i-- ) {

		points.push( this.surface_points[i][0] );
	}
	side = this._drawSide( points, this.options.tile_width_x );
	side.rotation.y = 180 * Math.PI / 180; // Rotate by X degrees
	side.position.x += this.get_center_x(); // Move into position
	land.add( side );
	
	// Z+
	points = [];
	for ( var i = 0; i < this.surface_points.length; i++ ) {
	
		points.push( this.surface_points[i][this.surface_points[i].length - 1] );
	}
	side = this._drawSide( points, this.options.tile_width_x );
	side.rotation.y = 0 * Math.PI / 180; // Rotate by X degrees. In this case, none needed.
	side.position.x += this.get_center_x(); // Move into position
	side.position.z += this.get_width_z();
	land.add( side );
	
	//
	// Draw base
	// TODO...

	return land;
};

Botman.LandLayer.prototype._drawSide = function( points, tile_width ) {

	var side = new THREE.Object3D();
	
	//
	// Draw light section
	
	var lightSideMaterial = new THREE.MeshLambertMaterial( { 
		color: 0x614126, 
		shading: THREE.FlatShading
	} );
	// Offset all the points so the center point is in the middle
	var left_offset = ( points.length - 1 ) * tile_width / 2 * -1;
	for ( var i = 0; i < points.length - 1; i++ ) {
		
		var left_x = left_offset + ( tile_width * i );
		var right_x = left_x + tile_width;
		var left_y = points[i];
		var right_y = points[i + 1];
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3( left_x, 0, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, right_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( left_x, left_y, 0 ) );
		geometry.vertices.push( new THREE.Vector3( right_x, 0, 0 ) );
		geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
		geometry.faces.push( new THREE.Face3( 0, 3, 1 ) );
		geometry.computeFaceNormals();

		var squareMesh = new THREE.Mesh( geometry, lightSideMaterial );
		side.add( squareMesh );
	}
	
	//
	// Draw dark section
	// TODO...
	
	return side;
};

