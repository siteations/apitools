//REMINDER OF INITIALIZE VARIABLES

console.log(Object.keys(catalogs));

//var test = catalogs.Virginia;

var colors=['#00b24d', '#00ac53', '#00a659','#00a05f','#009a65', '#00946b','#008d72','#008778','#00817e','#007b84','#00758a','#006f90'];
//12
var ornaments = ['#3f0000', '#720000', '#a50000', '#d80000'];

var stateStrg = 'Alabama · Alaska · Arizona · Arkansas · California · Colorado · Connecticut · Delaware · District of Columbia · Florida · Georgia · Hawaii · Idaho · Illinois · Indiana · Iowa · Kansas · Kentucky · Louisiana · Maine · Maryland · Massachusetts · Michigan · Minnesota · Mississippi · Missouri · Montana · Nebraska · Nevada · New Hampshire · New Jersey · New Mexico · New York · North Carolina · North Dakota · Ohio · Oklahoma · Oregon · Pennsylvania · Rhode Island · South Carolina · South Dakota · Tennessee · Texas · Utah · Vermont · Virginia · Washington · West Virginia · Wisconsin · Wyoming';


var stateA = ['Al', 'Ak','Az', 'Ar', 'Ca', 'Co', 'Ct','De', 'DC', 'Fl', 'Ga', 'Hi', 'Id', 'Il', 'In', 'Ia', 'Ks', 'Ky', 'La', 'Me', 'Md', 'Ma', 'Mi', 'Mn', 'Ms', 'Mo', 'Mt', 'Ne', 'Nv', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'Oh', 'Ok', 'Or', 'Pa', 'RI', 'SC', 'SD', 'Tn', 'Tx', 'Ut', 'Vt', 'Va', 'Wa', 'WV', 'Wi', 'Wy'];

var stateNames = stateStrg.split(' · ');

var container;
var camera, scene, renderer;
var mouse, raycaster;
var tree;
var cubeGeo, cubeMaterial;
var objects = [];
var objPg = [];
var vertical = new THREE.Vector3( 0, 1, 0 );
var rad = 0, hi = 1000, ephemRad = 0;
var contents={}; // state:{center:coordinates, label: coordinates} ;
var co = [];
var count = 0;
var countImg = 0;

var sY = 750;
var sX = -1800;
var xAdds = 0

for (var i=0; i<51; i++){
	if (i%13===0){sX=-1800, xAdds = i};
	// if (i===45){sX=-900};
	// if (i===48){sX=-600};
	// if (i===49){sX=0};
	if (i%13===0){sY-= 300};

	//console.log([sX+300*(i-xAdds), sY, 0], sX, xAdds, i);
	co.push([sX+300*(i-xAdds), sY, 0]);
}


stateNames.forEach((state, i)=>{

	contents[state] = {
		center: co[i],
		label: [],
		abbrev: stateA[i],
		cords: {},
		data: catalogs[state],
	}

})



addDivs(contents);
init();
//console.log(contents);

render(); //includes text update

animate();



function addDivs(contents){
	for (var state in contents){
		var div = document.createElement("div");
		div.id=state;
		div.className="info";
		document.body.append(div);
	};
}



function init() {

	//--------------------CAMERA & CONTAINER--------------------------------

	container = document.getElementById( 'terrain' );

	//perspective camera looking at scene
	camera = new THREE.PerspectiveCamera( 35,  window.innerWidth / window.innerHeight , 1, 15000 );
	camera.position.set( 0, 0, 400  ); //position A
	camera.lookAt( new THREE.Vector3() ); //just looks toward origin (0,0,0);

	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2( 0xf8efdf, 0.00030 );

	//--------------------Renderers-----------------------------
	renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xffffff);
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		// renderer.shadowMap.enabled = true;
		// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	container.appendChild( renderer.domElement );

	//console.log('render loaded init', renderer.domElement.width );

	//--------------------Controls-----------------------------

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );
	controls.enableZoom = true;
	controls.enablePan =true;
	controls.maxDistance =4500;
	controls.minDistance =200;

	//--------------------Lights-----------------------------
	var ambientLight = new THREE.AmbientLight( 0xf0f0f0 );
		scene.add( ambientLight );

	// for (var i =0; i<1; i++){

	var directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
		//directionalLight.position.set( 400, -600, 600 );
		directionalLight.position.set( 0,0,4);
		// directionalLight.castShadow = true;
		scene.add( directionalLight );
		//console.log(directionalLight);


	//--------------------------re-used elements-----------------
	tree = new THREE.TextureLoader().load( "./trees/fir.jpg", ()=>{render()} );

//for (var state in contents){
	var state = 'Virginia';
		//-----------------------------CREATE OBJECT AND EVOKE/RENDER IN EVENTS-------------------------------------
		contents[state].center = [0,0,0];


		var center = contents[state].center;

		if (contents[state].data !== undefined){
			var dataArr = contents[state].data;
		} else {
			var dataArr = contents['Arkansas'].data;
		}
		// tree positions, ephem positions, state label, titles/links labels

		var vaCoords = getTreeCoords (center[0],center[1], dataArr)

		var labelCenter = center[1]-(vaCoords.radTr+40);
		contents[state].label = [center[0], labelCenter, 0];
		contents[state].cords = vaCoords ;
		//{ptsTr:coordTree, ptsEph: cecoordEphm, radTr: rad, radEph: ephemRad};
		//--------------------TREES CORE---------------------------

		//alternate is to load by clicks
		if (contents[state].data !== undefined){
			createTree(vaCoords, dataArr);
		}
		console.log('catalogs count: ', count, countImg );
//}
//


	//--------------------RAY CASTERS---------------------------
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();


	//--------------------BACKGROUND SURFACE---------------------------
	var geometry = new THREE.PlaneGeometry( 9600, 4800, 1, 1 );
	var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf1ebe8});

	plane = new THREE.Mesh( geometry, planeMaterial );
	// plane.receiveShadow = true;
	scene.add( plane );

	document.getElementById('terrain').style.display = "block";
	document.getElementById('loader').style.display = "none";



	//--------------------Listeners-----------------------------

		document.addEventListener( 'mousemove', toPan, false );
		document.addEventListener( 'click', toLoad, false );

		// stateNames.forEach((state, i)=>{
		// 	var stInstance = document.getElementById(state);
		// 	stInstance.addEventListener( 'click', clickCreate, false );
		// })



		window.addEventListener( 'resize', onWindowResize, false );
}

// ---------------- CORE FUNCTIONS AND MOUSEOVER INTERACTIONS ------------------------------------

function onWindowResize() {
	camera.aspect =  window.innerWidth / window.innerHeight ;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// ------------------------------- MOUSEOVER INTERACTIONS ------------------------------------


function toPan( event ) {
				event.preventDefault();
				mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ) {
					var intersect = intersects[ 0 ];
				}
				render();
}

function toCenter( event ) {
				event.preventDefault();
				mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ) {
					var intersect = intersects[ 0 ];
					console.log('double click', intersect.point);
					const x0=controls.target.x;
					const y0=controls.target.y;
					var x1 = intersect.point.x;
					var y1 = intersect.point.y;
						camera.lookAt( new THREE.Vector3(x1,y1,0) );
						controls.target.x = x1;
						controls.target.y = y1;
					render();
					// rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
					// rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
				}

}

function clickCreate(event) {
	console.log(contents[event.target.id], event.target.id);

		if (contents[event.target.id].data !== undefined){
			createTree(contents[event.target.id].cords, contents[event.target.id].data);
			render();
		}
}


function toLoad( event ) {
				//event.preventDefault();
				mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 && event.target.id !== 'a') {
					var intersect = intersects[ 0 ].object;

							objPg.forEach(shp=>scene.remove(shp));
							objPg = [];

					if (intersect.geometry.type==='SphereGeometry'&& intersect.data.img !== null){
						addObjs(intersect);
					} else if (intersect.geometry.type==='SphereGeometry'&& intersect.data.img === null){
						updateFooter(null);
						render();
					}
				}
}


function animate(){
	setTimeout(loadInterval, 2000);

	function loadInterval(){
		var int = 0;
		var interval;
		var test = objects;
		var colors = new THREE.Color( 0xc0c0c0 );
		var colors2 = new THREE.Color( 0xdaa520 );

		function addInt (){
			if (test[int].data.img){
				addObjs(test[int]);
				test[int].material.color = colors;
				//console.log('got here', test, int);
				int++;
			} else {
				test[int].material.color = colors2;
				objPg.forEach(shp=>scene.remove(shp));
				objPg = [];
				render();
				int++;
			}
			if (int>=test.length-1){
				clearInterval(interval);
			}
		}

		var interval = setInterval(addInt, 200);

	}
}


function addObjs(geo){

		objPg.forEach(shp=>scene.remove(shp));
		objPg = [];
		// updateLabels (0,-1*(rad+15),0,'state', '');

		if (geo.data.img.length>0){

		geo.data.img.forEach((image, i)=>{
			var geobox = new THREE.BoxGeometry( 30, 45, .5 );

			// instantiate a loader
			//console.log(image);
			var texture = image;
						var material = new THREE.MeshBasicMaterial( { map: texture });
						material.needsUpdate = true;
						var pos = geo.data.center[i];
						// console.log(pos);
						if (pos !== undefined){
							geobox.translate(pos[0], pos[1], pos[2]+(-.25*i));

							var box = new THREE.Mesh( geobox, material );
							// box.castShadow = true;
							scene.add( box );
							objPg.push( box );

						}

						render();

		})

		updateFooter (geo.titles);

	}

}


function render() {
	renderer.render( scene, camera );

	for (var st in contents){
		if (contents[st].label.length>0){ // until updated
			var loc = contents[st].label;
			//console.log(loc);
			updateLabels (...loc, st , contents[st].abbrev);
		}
	}

	//console.log(camera.position);

}


function createVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z);
  var p2 = p.clone();
  var vector = p2.project(camera);

  var xV = (vector.x + 1) / 2 * width/2;
  var yV = -(vector.y - 1) / 2 * height/2;
  var zV = 0;

  return [xV, yV, zV];
}


function updateLabels (x,y,z, id, text){
	var screenpt = createVector(x,y,z, camera, renderer.domElement.width, renderer.domElement.height);
	//console.log('render loaded', screenpt, controls);
	var label = document.getElementById(id);
		label.innerText= text;
		label.style.left = screenpt[0]-label.clientWidth/2;
		label.style.top = screenpt[1]-label.clientHeight/2;
}

function updateFooter (text){

	if (text !== null){
		for (var key in text){
			var element = document.getElementById(key);

			if (key === 'a'){
				element.href = text[key];
			} else if (key === 'states' || key === 'types'){
				element.innerText = text[key].join(', ');
			} else {
				element.innerText = text[key];
			}

		}

	} else {

		var arr = ['states', 'types', 'date', 'place', 'title'];
		var element = document.getElementById('a');
				element.href = '';
		arr.forEach(item=>{
				element = document.getElementById(item);
				element.innerText = '';
		})

	}

}

//-----------------------------CREATE OBJECT AND EVOKE/RENDER IN EVENTS-------------------------------------

// tree positions, ephem positions, state label, titles/links labels

function getTreeCoords (cX, cY,itemArr){

	//tree circle
	var rem = itemArr.length-1;
			rad = 0, hi = 1000, ephemRad = 0;

	var coords = [[cX,cY,hi]];

	while (rem>0){
		rad += 6;
		hi -=6;
		var circ=Math.PI*2*rad;
		var cnt = Math.floor(circ/9);
		//var wedge = 360/cnt;
		for (var i=0; i<cnt; i++){
			//var angle=wedge*i;
			var x = cX + rad * Math.cos(2*i*Math.PI/cnt)
			var y = cY + rad * Math.sin(2*i*Math.PI/cnt)
			coords.push([x,y,hi])
		}
		rem -= cnt;
	}

	var dif = hi-10;
	var coordTree = coords.map(item=>{
		var newHi = item[2]-dif;
		item[2]= newHi
		return item;
	})

	//ephemera circle
	var coordEphm=[];
	ephemRad = rad + 6+20;
	hi = 4;

	circ=Math.PI*2*ephemRad;
	cnt = Math.floor(circ/30);
		//var wedge = 360/cnt;
	for (var i=0; i<cnt; i++){
		//var angle=wedge*i;
		x = cX + ephemRad * Math.cos(2*i*Math.PI/cnt)
		y = cY + ephemRad * Math.sin(2*i*Math.PI/cnt)
		coordEphm.push([x,y,hi,(2*i*Math.PI/cnt)])
	}

	return {ptsTr:coordTree, ptsEph: coordEphm, radTr: rad, radEph: ephemRad};
}

function createTree(vaCoords, itemArr){

	itemArr.forEach((item, i)=>{
		//var geosphere = new THREE.SphereGeometry( 4, 32, 32 );
		var geosphere = new THREE.SphereGeometry( 4, 5, 5);
		var img;
		//(item.pages)? img = item.pages.map(pg=>new THREE.TextureLoader().load(pg.img)): img = null;
		(item.pages)? img = item.pages.map(pg=>new THREE.TextureLoader().load(pg.img)): img = null;
		(item.pages)? countImg += item.pages.length:  countImg += 0;
		var each = !(item.pages);

		var material = new THREE.MeshLambertMaterial( { color: (each)? ornaments[Math.ceil(Math.random()*3)] :colors[Math.ceil(Math.random()*11)], map: (each)? null : tree} );

		//geosphere.translate(12*i,0,25);
		geosphere.translate(...vaCoords.ptsTr[i]);
		var sphere = new THREE.Mesh( geosphere, material );
		// sphere.castShadow = true;
		// sphere.receiveShadow = false;
		sphere.data=({img: (each)? null :img, center: vaCoords.ptsEph });
		sphere.name = 'item-'+item.itemId;
		sphere.titles = ({title:item.title, a: item.url, date: item.date, place: item.place, states: (each)? [] :item.states, types: (each)? [] :item.trees })
		scene.add( sphere );
		objects.push( sphere );
		count ++;
	})

	var geobase = new THREE.CircleGeometry( vaCoords.radTr-4, 64 );
	var mat = new THREE.MeshLambertMaterial( { color: 0xcfe2d7, side: THREE.DoubleSide } );

		//geosphere.translate(12*i,0,25);
		geobase.translate(vaCoords.ptsTr[0][0],vaCoords.ptsTr[0][1], 10);
		var treeBase = new THREE.Mesh( geobase, mat );
		// treeBase.castShadow = true;
		// treeBase.receiveShadow = true;
		treeBase.name = 'base-'+'state';
		scene.add( treeBase );
		objects.push( treeBase );
		// document.getElementById('loaderText').innerText = count + ' catalogs';
}
