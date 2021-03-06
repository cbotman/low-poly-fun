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
	var near = 1;
	var far = 10000;
	var camera = new THREE.PerspectiveCamera( view_angle, aspect, near, far );
	this.scene.add( camera );
	camera.position.set( 200, 110, 100 );
	camera.lookAt( this.scene.position );
	this.camera = camera;

	//
	// Renderer
	var renderer = null;
	if ( Detector.webgl ) {

		renderer = new THREE.WebGLRenderer( {
			antialias: true,
			alpha: true
		} );
	}
	else {

		renderer = new THREE.CanvasRenderer();
	}
	this.renderer = renderer;
	renderer.setSize( screen_width, screen_height );
	renderer.setClearColor( 0x555555, 1 );

	// Shadows
	if ( renderer.shadowMap ) {

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}
	else {

		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
	}

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
	
	/*
	// create a small sphere to show position of light
	var lightbulb = new THREE.Mesh(
		new THREE.SphereGeometry( 5, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
	);
	
	var light = new THREE.PointLight( 0xffffff, 0.75, 350 );
	light.position.set( -20, 80, -40 );
	light.add( lightbulb );
	this.scene.add( light );
	*/
	var directional_light = new THREE.DirectionalLight( 0xff9900, 0.55 );
	directional_light.position.set( 50, 60, -25 );
	directional_light.castShadow = true;
	directional_light.shadowDarkness = 0.2;
	directional_light.shadowCameraVisible = false;
	directional_light.shadowCameraNear = 10;
	directional_light.shadowCameraFar = 250;
	directional_light.shadowCameraRight = 100;
	directional_light.shadowCameraLeft = -100;
	directional_light.shadowCameraTop = 100;
	directional_light.shadowCameraBottom = -100;
	directional_light.shadowMapWidth = 5000;
	directional_light.shadowMapHeight = 5000;
	this.scene.add( directional_light );

	var ambientLight = new THREE.AmbientLight( 0x666666 );
	var intensity = 1.0;
	ambientLight.color.setRGB(
		ambientLight.color.r * intensity,
		ambientLight.color.g * intensity,
		ambientLight.color.b * intensity );
	this.scene.add( ambientLight );
	
	// Attach a soft light to the camera
	var camera_light = new THREE.PointLight( 0xffffff, 0.25, 250 );
	this.camera.add( camera_light );

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

Botman.Main.prototype.recreate = function( seed ) {

	// Ensure initiated
	this.init();

	// Generate new seed unless one was provided and set the URL appropriately
	if ( typeof seed === 'undefined' || seed === -1 || seed === '' ) {

		seed = Botman.Util.random_int( 1, 233280 );
	}
	Math.seed = parseInt( seed );
	if ( window.history && window.history.replaceState ) {

		try {
		
			window.history.replaceState( {}, document.title, '?seed=' + seed );
		}
		catch ( exception ) {
		
			console.log( exception );
		}
	}

	// Clear existing world, if there is one. Don't want to reset the camera position, etc.
	this.scene.remove( this.scene.getObjectByName( 'land' ) );
	this.scene.remove( this.scene.getObjectByName( 'trees' ) );

	// Create new world
	// The elements of the scene have been divided into layers, just to help organise code. Inevitably, most layers
	// will need to know about the land layer as things are mostly relative to that.

	// Land
	this.land_layer = new Botman.LandLayer( {
		tile_width_x: 10,
		tile_width_z: 10,
		target_highest_point: 50,
		color_map: [
			[0xFFFFFF],
			[0x705A3D],
			[0x705A3D],
			[0xD6D177],
			[0xD6D177],
			[0xD6D177]
		]
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

	// Paper texture 
	var paper_texture = new Botman.PaperTexture( {
		width: 160, // TODO: base width on land_layer width
		depth: 160, 
		height: 50
	} );
	paper_texture.apply_to( land );
	
	this.render();
};
