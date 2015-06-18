
Botman.LandLayer = function( options ) {

	// Options
	this.options = $.extend( true, {}, Botman.LandLayer.default_options, options );

	// State
	this.surface_points = [];
};

Botman.LandLayer.default_options = {
	tile_width: 10,
	tile_height: 10
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
	
	this.surface_points = points;
};

Botman.LandLayer.prototype.get_x_width = function() {

	return ( ( this.surface_points.length - 1 ) * this.options.tile_width );
};

Botman.LandLayer.prototype.get_center_x = function() {

	return this.get_x_width() / 2;
};

Botman.LandLayer.prototype.get_z_width = function() {

	if ( this.surface_points.length == 0 ) {

		return 0;
	}
	return ( ( this.surface_points[0].length - 1 ) * this.options.tile_height );
};

Botman.LandLayer.prototype.get_center_z = function() {

	return this.get_z_width() / 2;
};

Botman.LandLayer.prototype.draw = function() {

	var land = new THREE.Object3D();

	//
	// Draw surface terrain
	
	var material = new THREE.MeshLambertMaterial( { color: 0xD8D6A3, shading: THREE.FlatShading } );
	//var material = new THREE.MeshBasicMaterial( { color: 0xD8D6A3, side: THREE.DoubleSide } );

	for ( var x = 0; x < this.surface_points.length - 1; x++ ) {

		for ( var y = 0; y < this.surface_points[x].length - 1; y++ ) {

			var geometry = new THREE.Geometry();

			var tile_width = this.options.tile_width;
			var tile_height = this.options.tile_height;

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( x * tile_width, this.surface_points[x][y], y * tile_height ) );
			geometry.vertices.push( new THREE.Vector3( x * tile_width, this.surface_points[x][y + 1], ( y * tile_height ) + tile_height ) );
			geometry.vertices.push( new THREE.Vector3( ( x * tile_width ) + tile_width, this.surface_points[x + 1][y], y * tile_height ) );
			geometry.vertices.push( new THREE.Vector3( ( x * tile_width ) + tile_width, this.surface_points[x + 1][y + 1], ( y * tile_height ) + tile_height ) );
			geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
			geometry.faces.push( new THREE.Face3( 3, 2, 1 ) );
			geometry.computeFaceNormals();

			var square_mesh = new THREE.Mesh( geometry, material );
			land.add( square_mesh );
		}
	}
	
	//
	// Draw sides
	
	// X-
	var points = this.surface_points[0];
	var side = this._drawSide( points );
	side.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -1.57079633 );
	land.add( side );
	
	// X+
	points = this.surface_points[this.surface_points.length - 1];
	/*
	side = this._drawSide( points.reverse() );
	side.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), 1.57079633 );
	side.translateX( this.get_x_width() * -1 );
	side.translateZ( this.get_z_width() );
	land.add( side );
	*/
	// Z-
	points = this.surface_points.map( function( value, index ) {
	
		return value[0];
	} );
	side = this._drawSide( points.reverse() );
	side.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), 1.57079633 * 2 );
	side.translateX( this.get_x_width() * -1 );
	land.add( side );
	return land;

/*
	// Z+
	points = this.surface_points.map( function( value, index ) {
	
		return value[value.length - 1];
	} );
	side = this._drawSide( points );
	side.translateZ( this.get_z_width() );
	land.add( side );
	return land;
*/
};

Botman.LandLayer.prototype._drawSide = function( points ) {

	var side = new THREE.Object3D();
	
	var lightSideMaterial = new THREE.MeshLambertMaterial( { 
		color: 0x614126, 
		shading: THREE.FlatShading
	} );
	for ( var i = 0; i < points.length - 1; i++ ) {
		
		var left_x = this.options.tile_width * i;
		var right_x = left_x + this.options.tile_width;
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
	
	return side;
};

