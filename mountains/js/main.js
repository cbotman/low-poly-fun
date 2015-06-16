
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
};

Botman.Main.prototype.init = function() {

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
	// the camera defaults to position (0,0,0)
	// so pull it back (z) and up (y) and set the angle towards the scene origin
	this.camera.position.set( 200, 100, 100 );
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
	// Start animation loop
	this.animate();

	//
	// Done
	this.is_initiated = true;
};

Botman.Main.prototype.animate = function() {

	// TODO: fix reference issue
	//requestAnimationFrame( self.animate );
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
	// ...

	// Create new world
	//var surface_points = Util.diamond_square( ... );
	//Botman.LandLayer.draw( surface_points, scene );
	//Botman.TreeLayer.draw( surface_points, scene );

	// create a set of coordinate axes to help orient user
	//    specify length in pixels in each direction
	var axes = new THREE.AxisHelper( 100 ); // X = Red, Y = Green, Z = Blue
	this.scene.add( axes );

	this.render();
};
