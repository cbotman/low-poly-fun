
Botman.TreeLayer = function( options ) {

	// Options
	this.options = $.extend( true, {}, Botman.TreeLayer.default_options, options );

	// State
};

Botman.TreeLayer.default_options = {
	tree_scale: 2,
};

Botman.TreeLayer.prototype.draw = function() {

	var trees = new THREE.Object3D();
	
	// Draw a single tree
	var material = new THREE.MeshLambertMaterial( { 
		color: 0x9ACD32, 
		shading: THREE.FlatShading 
	} );
	
	var tree_height = 5 * this.options.tree_scale;
	var tree_diameter = 1 * this.options.tree_scale;
	
	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3( 0, tree_height, 0 ) ); // top
	geometry.vertices.push( new THREE.Vector3( -tree_diameter, 0, tree_diameter ) ); // sw
	geometry.vertices.push( new THREE.Vector3( tree_diameter, 0, tree_diameter ) ); // se
	geometry.vertices.push( new THREE.Vector3( tree_diameter, 0, -tree_diameter ) ); // ne
	geometry.vertices.push( new THREE.Vector3( -tree_diameter, 0, -tree_diameter ) ); // nw
	geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // south
	geometry.faces.push( new THREE.Face3( 2, 3, 0 ) ); // east
	geometry.faces.push( new THREE.Face3( 3, 4, 0 ) ); // north
	geometry.faces.push( new THREE.Face3( 4, 1, 0 ) ); // west
	geometry.computeFaceNormals();

	var mesh = new THREE.Mesh( geometry, material );
	trees.add( mesh );
	
	trees.position.y = 50;
	
	return trees;
};
