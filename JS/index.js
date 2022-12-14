// Data complied from OpenStreetMap: https://www.openstreetmap.org/
// Based on the tutorial from: https://youtu.be/L-YF5mZm4rs 

import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
//import {getDistance, getRhumbLineBearing} from 'geolib';


let scene, renderer, camera, controls;
let axesHelper;
let center = [103.847,1.283];
let Material_Building = new THREE.MeshPhongMaterial();

//initial the scene, renderer, camera
function initial() {
  // build scene
  scene = new THREE.Scene();

  // build renderer
  if (window.WebGLRenderingContext) {
    renderer = new THREE.WebGLRenderer();
  } else {
    renderer = new THREE.CanvasRenderer();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.0); // background color
  renderer.shadowMap.enable = true; // set shadow

  // Setup DOM
  document.body.appendChild(renderer.domElement);

  // build camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z =0;
  camera.position.y =4;
  camera.position.x =8;
  camera.lookAt(scene.position);

  // setup lighting
  let light0 = new THREE.AmbientLight(0xfafafa, 0.25)

  let light1 = new THREE.PointLight(0xffffff, 0.5)
  light1.position.set(200, 90, 40)

   let light2 = new THREE.PointLight(0xfafafa, 0.5)
   light2.position.set(200, 90, -40)

    scene.add(light0)
    scene.add(light1)
    scene.add(light2)

    
  const geometry = new THREE.BoxGeometry(60, 0.1, 40); // Geometry
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff90
  }); // material
  let ground = new THREE.Mesh(geometry, material); // mesh
  ground.position.set(6, -0.5, 2.5);
  scene.add(ground);
/*
  const boxG = new THREE.BoxGeometry(1, 1, 1);
  const boxM = new THREE.MeshBasicMaterial({
    color: 0xffffee
  });
  const box = new THREE.Mesh(boxG,boxM);
  box.position.set(0, 0.5, 5);
  scene.add(box);
*/
  // axeshelper and gridhelper are helpful while coding
  // I turned them off in the end
  axesHelper = new THREE.AxesHelper(1000);
  //scene.add(axesHelper);
  let gh = new THREE.GridHelper(60, 160, new THREE.Color( 0x555555), new THREE.Color(0x222222))
  //scene.add(gh)


  window.addEventListener('resize', onWindowResize, false)
  onWindowResize()

  // encountered difficulties of importing mapCnotrols, so now using orbitcontrols instead
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(4.5, 0, 4.5);
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxDistance = 800;
  controls.update();

  Update();
  
}

function render() {
  //animate(); 
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// adjust the canva after resizing the window
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function Update(){
    requestAnimationFrame(Update);

    renderer.render(scene, camera)
    controls.update()
}

// get the JSON file 
function getGeoJson(){
  fetch("./SGDowntown.geojson").then((res)=>{
    res.json().then((data)=>{
      loadBuilding(data)
    })
  });
}

// load the building info
function loadBuilding(data){
  let features = data.features;
  for (let i = 0; i < features.length; i++) {

    let fel = features[i]
    
    if(!fel['properties']) return
    if(fel.properties['building']){
        addBuilding(fel.geometry.coordinates, fel.properties, fel.properties['building:levels']);
        
    }
  }
}

// add the building to the scene
function addBuilding(data, info, height=1){
  for(let i=0; i<data.length;i++){
    let elem = data[i];

    let shape = getShape(elem,center);
    let geometry = genGeometry(shape, {
      curveSegment: 1,
      depth: 0.05*height,
      bevelEnabled: false,
    });

    // since y-axis is the vertical direction the axes need adjustment to look normal
    geometry.rotateX(Math.PI / 2)
    geometry.rotateZ(Math.PI)

    let mesh = new THREE.Mesh(geometry, Material_Building);
    scene.add(mesh);
    
  }

}
 
// get the shape from the coordinates from the JSON file
function getShape(points,center){
  let shape = new THREE.Shape();

  for(let i = 0;i<points.length;i++){
    let elp = points[i];
    elp = GPSrelativePosition(elp, center);

    if(i==0){
      shape.moveTo(elp[0],elp[1]);
    }else{
      shape.lineTo(elp[0],elp[1]);
    }
  }
  return shape;
  
}
// generate a 3d object from the shape
function genGeometry(shape, config){
  
  let geometry = new THREE.ExtrudeBufferGeometry(shape, config);
  geometry.computeBoundingBox();
  return geometry;
}

// calculate and adjust the x, y coordinates
function GPSrelativePosition(objPos, centerPos)
{
  // Since I could not find a way to import geolib, so made a bit change here
  // GPS distance
  //let distance = window.geolib.getDistance(objPos, centerPos);
  // bearing angle
  //let bearing = window.geolib.getRhumbLineBearing(objPos, centerPos);

  // Calculate x
  let x = objPos[0]-centerPos[0];//+(distance*Math.cos(bearing*Math.PI / 180));

  // Calculate y
  let y = objPos[1]-centerPos[1];//+(distance*Math.sin(bearing*Math.PI / 180));
  
  //console.log(x,y), *1000 to make it's wide-length ratio reseanable ;
  return [-x*1000, y*1000];
  
}

initial();
render();
getGeoJson();

