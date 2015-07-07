'use strict';

Botman.Main = function() {

	// Self reference for events
	this.self = this;

	// Internal state
	this.is_initiated = false;

	// Three JS properties
	this.container = null;
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.controls = null;
	this.stats = null;
	this.keyboard = new KeyboardState();
	this.clock = new THREE.Clock();

	// World properties (i.e. the world/scene we're drawing)
	this.surface_points = [];
	this.land = null;
	this.land_layer = null;
	this.tree_layer = null;
};

Botman.Main.prototype.init = function() {

	/*
	for ( var i = 0; i < 100; i++ ) {
	
		console.log( Botman.Util.normally_distributed_random() );
	}
	*/

	//
	// Only need to init once
	if ( this.is_initiated ) {

		return;
	}

	//
	// Scene
	this.scene = new THREE.Scene();

	//
	// Camera
	var screen_width = window.innerWidth;
	var screen_height = window.innerHeight;
	var view_angle = 45;
	var aspect = screen_width / screen_height;
	var near = 0.1;
	var far = 20000;
	this.camera = new THREE.PerspectiveCamera( view_angle, aspect, near, far );
	this.scene.add( this.camera );
	this.camera.position.set( 200, 110, 100 );
	this.camera.lookAt( this.scene.position );

	//
	// Renderer
	if ( Detector.webgl ) {

		this.renderer = new THREE.WebGLRenderer( {
			antialias: true,
			alpha: true
		} );
	}
	else {

		this.renderer = new THREE.CanvasRenderer();
	}
	this.renderer.setSize( screen_width, screen_height );
	this.renderer.setClearColor( 0xffffff, 0 );

	//
	// Container
	this.container = document.getElementById( 'container' );
	this.container.appendChild( this.renderer.domElement );

	//
	// Events

	// automatically resize renderer
	THREEx.WindowResize( this.renderer, this.camera );

	//
	// Controls

	// toggle full-screen on given key press
	THREEx.FullScreen.bindKey( { charCode: 'm'.charCodeAt( 0 ) } );

	// move mouse and: left   click to rotate,
	//                 middle click to zoom,
	//                 right  click to pan
	this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

	//
	// Stats
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.bottom = '0px';
	this.stats.domElement.style.zIndex = 100;
	this.container.appendChild( this.stats.domElement );
	
	//
	// Axis
	var axes = new THREE.AxisHelper( 100 ); // X = Red, Y = Green, Z = Blue
	//this.scene.add( axes );
	
	//
	// Lighting
	// TODO: lighting feels like it's more of the scene/world than init stuff
	
	// create a small sphere to show position of light
	var lightbulb = new THREE.Mesh(
		new THREE.SphereGeometry( 5, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
	);
	
	var light = new THREE.PointLight( 0xffffff, 0.75, 350 );
	light.position.set( -20, 80, -40 );
	light.add( lightbulb );
	this.scene.add( light );
	
	var ambientLight = new THREE.AmbientLight( 0x666666 );
	var intensity = 1.0;
	ambientLight.color.setRGB(
		ambientLight.color.r * intensity,
		ambientLight.color.g * intensity,
		ambientLight.color.b * intensity );
	this.scene.add( ambientLight );
	
	// Attach a soft light to the camera
	// TODO: wastful having pointlight here? make it a spotlight
	var light2 = new THREE.PointLight( 0xffffff, 0.5, 250 );
	this.camera.add( light2 );

	//
	// Start animation loop
	this.animate();

	//
	// Done
	this.is_initiated = true;
};

Botman.Main.prototype.animate = function() {

	requestAnimationFrame( this.animate.bind( this ) );
	this.render();
	this.update();
};

Botman.Main.prototype.render = function() {

	this.renderer.render( this.scene, this.camera );
};

Botman.Main.prototype.update = function() {

	// delta = change in time since last call (in seconds)
	var delta = this.clock.getDelta();

	this.controls.update();
	this.stats.update();
};

Botman.Main.prototype.recreate = function() {

	// Ensure initiated
	this.init();

	// Clear existing world, if there is one. Don't want to reset the camera position, etc.
	this.scene.remove( this.scene.getObjectByName( 'land' ) );
	this.scene.remove( this.scene.getObjectByName( 'trees' ) );

	// Create new world
	// The elements of the scene have been divided into layers, just to help organise code. Inevitably, most layers
	// will need to know about the land layer as things are mostly relative to that.

	// Land
	this.land_layer = new Botman.LandLayer( {
		tile_width_x: 10,
		tile_width_z: 10
	} );
	this.land_layer.compute_surface_points();
	var land = this.land_layer.draw();
	land.name = 'land';
	land.translateX( this.land_layer.get_center_x() * -1 );
	land.translateZ( this.land_layer.get_center_z() * -1 );
	this.scene.add( land );
	
	// Tree
	this.tree_layer = new Botman.TreeLayer( {
		land_layer: this.land_layer
	} );
	var trees = this.tree_layer.draw();
	trees.name = 'trees';
	this.scene.add( trees );

	this.render();
};
