
/**
 TODO:
 - create a canvas texture and apply to landscape
*/

/*
noise.seed( Math.random() );
var points = new Array( 20 );
for ( var x = 0; x < points.length; x++ ) {

	points[x] = new Array( 20 );
	for ( var y = 0; y < points[x].length; y++ ) {

		var value = noise.simplex2( x / 20, y / 20 ); // division here effectively zooms in on a feature
		value = Math.abs( value );
		points[x][y] = value * 75; // multiplication here amplifies features
	}
}
console.log(points);
*/

var points = diamond_square( 17, 0, 7 );
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

//////////	
// MAIN //
//////////

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();

// initialization
init();

// animation loop / game loop
animate();

///////////////
// FUNCTIONS //
///////////////
			
function init() 
{
	///////////
	// SCENE //
	///////////
	scene = new THREE.Scene();

	////////////
	// CAMERA //
	////////////
	
	// set the view size in pixels (custom or according to window size)
	// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// set up camera
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	// add the camera to the scene
	scene.add( camera );
	// the camera defaults to position (0,0,0)
	// 	so pull it back (z) and up (y) and set the angle towards the scene origin
	camera.position.set( 200, 100, 100 );
	camera.lookAt( scene.position );	
	
	//////////////
	// RENDERER //
	//////////////
	
	// create and start the renderer; choose antialias setting.
	if ( Detector.webgl ) {
		renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );
	}
	else {
		renderer = new THREE.CanvasRenderer(); 
	}
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.setClearColor( 0xffffff, 0 );
	
	// attach div element to variable to contain the renderer
	container = document.getElementById( 'container' );
	// alternatively: to create the div at runtime, use:
	//   container = document.createElement( 'div' );
	//    document.body.appendChild( container );
	
	// attach renderer to the container div
	container.appendChild( renderer.domElement );
	
	////////////
	// EVENTS //
	////////////

	// automatically resize renderer
	THREEx.WindowResize( renderer, camera );
	// toggle full-screen on given key press
	THREEx.FullScreen.bindKey( {charCode : 'm'.charCodeAt(0)} );
	
	//////////////
	// CONTROLS //
	//////////////

	// move mouse and: left   click to rotate, 
	//                 middle click to zoom, 
	//                 right  click to pan
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	///////////
	// STATS //
	///////////
	
	// displays current and past frames per second attained by scene
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	///////////
	// LIGHT //
	///////////

	// create a small sphere to show position of light
	var lightbulb = new THREE.Mesh(
		new THREE.SphereGeometry( 5, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
	);

	// create a light
	var light = new THREE.PointLight( 0xffffff, 0.75, 350 );
	light.position.set( 20, 80, 40 );
	light.add( lightbulb );
	scene.add( light );
	var ambientLight = new THREE.AmbientLight( 0x666666 );
	scene.add( ambientLight );
	
	var light2 = new THREE.PointLight( 0xffffff, 0.5, 250 );
	camera.add( light2 );

	//lightbulb.position.set( light.position.x, light.position.y, light.position.z );
	//scene.add( lightbulb );

	//////////////
	// GEOMETRY //
	//////////////
		
	var terrain_width = ( points.length - 1 ) * 10;
	var terrain_height = ( points[0].length - 1 ) * 10;
	
	var terrain = new THREE.Object3D();
	terrain.position.x -= terrain_width / 2;
	terrain.position.z -= terrain_height / 2;
	scene.add( terrain );
	
	// most objects displayed are a "mesh":
	//  a collection of points ("geometry") and
	//  a set of surface parameters ("material")	
	var squareMaterial = new THREE.MeshLambertMaterial( { color: 0xD8D6A3, shading: THREE.FlatShading } );
	//var squareMaterial = new THREE.MeshBasicMaterial( { color: 0xD8D6A3, side: THREE.DoubleSide } );

	for ( var x = 0; x < points.length - 1; x++ ) {

		for ( var y = 0; y < points[0].length - 1; y++ ) {

			var geometry = new THREE.Geometry();

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y], y * 10 ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y + 1], ( y * 10 ) + 10 ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, points[x + 1][y], y * 10 ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, points[x + 1][y + 1], ( y * 10 ) + 10 ) );
			//geometry.mergeVertices();
			//geometry.computeVertexNormals();
			geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
			geometry.faces.push( new THREE.Face3( 3, 2, 1 ) );
			geometry.computeFaceNormals();

			var squareMesh = new THREE.Mesh( geometry, squareMaterial );
			terrain.add( squareMesh );
		}
	}
	
	// Draw the edges
	var sideMaterial = new THREE.MeshLambertMaterial( { color: 0x614126, shading: THREE.FlatShading } );
	var y = 0;
	for ( var x = 0; x < points.length - 1; x++ ) {
	
			var geometry = new THREE.Geometry();

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( x * 10, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y], 0 ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, points[x + 1][y], 0 ) );
			geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
			geometry.faces.push( new THREE.Face3( 3, 2, 1 ) );
			geometry.computeFaceNormals();

			var squareMesh = new THREE.Mesh( geometry, sideMaterial );
			terrain.add( squareMesh );
	}

	var y = points.length - 1;
	var z = ( points.length - 1 ) * 10
	for ( var x = 0; x < points.length - 1; x++ ) {
	
			var geometry = new THREE.Geometry();

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( x * 10, 0, z ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y], z ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, 0, z ) );
			geometry.vertices.push( new THREE.Vector3( ( x * 10 ) + 10, points[x + 1][y], z ) );
			geometry.faces.push( new THREE.Face3( 2, 1, 0 ) );
			geometry.faces.push( new THREE.Face3( 1, 2, 3 ) );
			geometry.computeFaceNormals();

			var squareMesh = new THREE.Mesh( geometry, sideMaterial );
			terrain.add( squareMesh );
	}
	
	var x = 0;
	for ( var y = 0; y < points[0].length - 1; y++ ) {
	
			var geometry = new THREE.Geometry();

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( 0, 0, y * 10 ) );
			geometry.vertices.push( new THREE.Vector3( 0, points[x][y], ( y * 10 ) ) );
			geometry.vertices.push( new THREE.Vector3( 0, 0, ( y * 10 ) + 10 ) );
			geometry.vertices.push( new THREE.Vector3( 0, points[x][y + 1], ( y * 10 ) + 10 ) );
			geometry.faces.push( new THREE.Face3( 2, 1, 0 ) );
			geometry.faces.push( new THREE.Face3( 1, 2, 3 ) );
			geometry.computeFaceNormals();

			var squareMesh = new THREE.Mesh( geometry, sideMaterial );
			terrain.add( squareMesh );
	}
	
	var x = ( points.length - 1 );
	for ( var y = 0; y < points[0].length - 1; y++ ) {
	
			var geometry = new THREE.Geometry();

			// X is left/right, Y is the up/down axis (height), and Z in/out of the screen
			geometry.vertices.push( new THREE.Vector3( x * 10, 0, y * 10 ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y], ( y * 10 ) ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, 0, ( y * 10 ) + 10 ) );
			geometry.vertices.push( new THREE.Vector3( x * 10, points[x][y + 1], ( y * 10 ) + 10 ) );
			geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
			geometry.faces.push( new THREE.Face3( 3, 2, 1 ) );
			geometry.computeFaceNormals();

			var squareMesh = new THREE.Mesh( geometry, sideMaterial );
			terrain.add( squareMesh );
	}
	
	// floor
	var geometry = new THREE.PlaneGeometry( terrain_width, terrain_height, 1 );
	var floor = new THREE.Mesh( geometry, sideMaterial );
	floor.rotation.x = Math.PI / 2;
	floor.position.x = terrain_width / 2;
	floor.position.z = terrain_height / 2;
	terrain.add( floor );

	// create a set of coordinate axes to help orient user
	//    specify length in pixels in each direction
	var axes = new THREE.AxisHelper( 100 ); // X = Red, Y = Green, Z = Blue
	//scene.add( axes );
	
}

function exampleTriangle() {

	// This code demonstrates how to draw a triangle
	var triangle = new THREE.Geometry();
	triangle.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
	triangle.vertices.push( new THREE.Vector3( 0, 0, 20 ) );
	triangle.vertices.push( new THREE.Vector3( 20, 0, 0 ) );

	triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );

	return triangle;
}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
	// delta = change in time since last call (in seconds)
	var delta = clock.getDelta(); 	
		
	controls.update();
	stats.update();
}

function render() 
{	
	renderer.render( scene, camera );
}
