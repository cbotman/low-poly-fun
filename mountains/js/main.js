
Botman.Main = function() {
};

// Internal state
Botman.Main.prototype.is_initiated = false;

// Three JS properties
Botman.Main.prototype.container = null;
Botman.Main.prototype.scene = null;
Botman.Main.prototype.camera = null;
Botman.Main.prototype.renderer = null;
Botman.Main.prototype.controls = null;
Botman.Main.prototype.stats = null;
Botman.Main.prototype.keyboard = new KeyboardState();
Botman.Main.prototype.clock = new THREE.Clock();

// World properties (i.e. the world/scene we're drawing)

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

	//
	// Done
	this.is_initiated = true;
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
};
