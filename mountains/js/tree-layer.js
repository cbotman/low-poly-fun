
Botman.TreeLayer = function( options ) {

	// Options
	this.options = $.extend( true, {}, Botman.TreeLayer.default_options, options );

	// State
	this.trees = null;
};

Botman.TreeLayer.default_options = {
	land_layer: null, // Need some geography to draw onto :)
	tree_scale: 2
};

Botman.TreeLayer.prototype.get_trees = function() {

	return this.trees;
};

Botman.TreeLayer.prototype.draw = function() {

	// If no land layer, cannot draw
	if ( this.options.land_layer == null ) {

		return null;
	}

	var trees = new THREE.Object3D();

	//
	// Add a single tree

	var material = new THREE.MeshLambertMaterial( { 
		color: 0x9ACD32, 
		shading: THREE.FlatShading 
	} );

	//
	// Draw the tree
	
	var tree_height = 5 * this.options.tree_scale;
	var tree_radius = 1 * this.options.tree_scale;
	
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

	// Randomly rotate the tree
	// TODO...

	var tree = new THREE.Mesh( geometry, material );

	//
	// Position the tree on the land

	// Start by ensuring the tree is higher than the land
	tree.position.y = this.options.land_layer.get_highest_point() * 2;

	// TODO: right idea I think, but not working just yet

	// Cast a ray downwards from the tree to find what it's over
	var raycaster = new THREE.Raycaster();
	raycaster.set( tree.position, new THREE.Vector3( 0, -1, 0 ) );
	var intersects = raycaster.intersectObject( this.options.land_layer.get_land(), true );

	// Sit the tree on the surface
	if ( intersects.length > 0 ) {

		console.log(intersects[0]);
		tree.position.setY( intersects[0].point.y );
	}

	// Partially match the normal of the surface?

	// Add tree to layer
	trees.add( tree );

	// Update reference
	this.trees = trees;
	
	return trees;
};
