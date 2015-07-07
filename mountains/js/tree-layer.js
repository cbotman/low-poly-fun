'use strict';

Botman.TreeLayer = function( options ) {

	// Options
	options = $.extend( true, {}, Botman.TreeLayer.default_options, options );

	// State
	this._land_layer = options.land_layer;
	this._mean_tree_height = options.mean_tree_height;
	this.trees = null;
};

Botman.TreeLayer.default_options = {
	land_layer: null, // Need some geography to draw onto :)
	mean_tree_height: 4.5
};

Botman.TreeLayer.prototype.get_trees = function() {

	return this.trees;
};

Botman.TreeLayer.prototype.draw = function() {

	// If no land layer, cannot draw
	if ( this._land_layer == null ) {

		return null;
	}
	var land = this._land_layer.get_land();
	if ( land == null ) {

		return null;
	}

	var trees = new THREE.Object3D();
	
	// Match the land layer's position in world space
	trees.position.setX( land.position.x );
	trees.position.setZ( land.position.z );
	
	// Add trees to layer
	var tree_count = Botman.Util.random_int( 3, 150 );
	for ( var i = 0; i < tree_count; i++ ) {

		var tree = this.add_basic_pinetree();
		if ( tree != null ) {

			trees.add( tree );
		}
	}

	// Update reference
	this.trees = trees;
	
	return trees;
};

Botman.TreeLayer.prototype.add_basic_pinetree = function() {
	
	//
	// Add a single tree

	//
	// Create mesh
	var material = new THREE.MeshLambertMaterial( { 
		color: 0x9ACD32, 
		shading: THREE.FlatShading
	} );
	
	// Many trees will be the same max size, but have some variation in smaller ones.
	var tree_variation = Botman.Util.normally_distributed_random();
	var tree_height = tree_variation * this._mean_tree_height;
	var tree_radius = tree_height / 5;

	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3( 0, tree_height, 0 ) ); // top
	geometry.vertices.push( new THREE.Vector3( -tree_radius, 0, tree_radius ) ); // sw
	geometry.vertices.push( new THREE.Vector3( tree_radius, 0, tree_radius ) ); // se
	geometry.vertices.push( new THREE.Vector3( tree_radius, 0, -tree_radius ) ); // ne
	geometry.vertices.push( new THREE.Vector3( -tree_radius, 0, -tree_radius ) ); // nw
	geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // south
	geometry.faces.push( new THREE.Face3( 2, 3, 0 ) ); // east
	geometry.faces.push( new THREE.Face3( 3, 4, 0 ) ); // north
	geometry.faces.push( new THREE.Face3( 4, 1, 0 ) ); // west
	geometry.computeFaceNormals();

	var tree = new THREE.Mesh( geometry, material );

	// Randomly rotate the tree
	tree.rotation.y = Botman.Util.random_int( 0, 360 ) * Math.PI / 180; // Rotate by X degrees

	//
	// Position the tree on the land

	// Start by ensuring the tree is higher than the land
	// TODO: should ensure not too close to other trees
	tree.position.set(
		Botman.Util.random_int( tree_radius, this._land_layer.get_width_x() - tree_radius ),
		this._land_layer.get_highest_point() * 2,
		Botman.Util.random_int( tree_radius, this._land_layer.get_width_z() - tree_radius )
	);

	// Cast a ray downwards from the tree to find what it's over
	var raycaster = new THREE.Raycaster();
	raycaster.set( tree.position, new THREE.Vector3( 0, -1, 0 ) );
	var intersects = raycaster.intersectObject( this._land_layer.get_land(), true );

	// Sit the tree on the surface
	if ( intersects.length == 0 ) {

		return null;
	}
	var base_height = intersects[0].point.y;
	tree.position.setY( base_height );
	
	// Don't allow trees in the highest snow
	var color_index = this._land_layer.get_color_map_index( base_height );
	if ( color_index <= 1 ) {
	
		//tree.material.color.setHex( 0xff0000 );
		//return tree;
		return null;
	}

	// Partially match the normal of the surface?
	
	return tree;
};

