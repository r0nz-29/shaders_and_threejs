import * as THREE from "three";
// import * as utils from "./utils";
import rock from "./maps/hqdefault.jpg";
import * as dat from "dat.gui";
// import diff from './maps/real.png';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

const settings = {
  horizontalSegments: 100,
  verticalSegments: 100,
  allowMovement: false,
};

const vShader = `
  uniform sampler2D skin;
  uniform float height;
  varying vec2 vertexUV;
  void main() {
    vertexUV = uv;
    vec3 rgb = texture2D(skin, uv).xyz;
    float height = rgb.x + rgb.y + rgb.z;
    vec3 direction = normalize(position - normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + 30.0 * vec3(0.0, 0.0, height), 1.0);
  }
`;

const fShader = `
  uniform sampler2D diffuse;
  uniform sampler2D skin;
  varying vec2 vertexUV;
  void main() {
    vec3 rocks = texture2D(skin, vertexUV).xyz;
    vec3 base = texture2D(diffuse, vertexUV).xyz;
    gl_FragColor = vec4( base , 1.0);
  }
`;

export const makeScene = (data) => {
  const scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  var clock = new THREE.Clock();
  camera.position.set(0, 300, 500);
  camera.lookAt(new THREE.Vector3(0, -2400, 0));

  var camControls = new FirstPersonControls(camera);
  camControls.lookSpeed = 0.2;
  camControls.movementSpeed = 100.0;
  camControls.noFly = true;
  camControls.lookVertical = true;
  camControls.constrainVertical = true;
  camControls.verticalMin = 1.3;
  camControls.verticalMax = 1.8;
  camControls.activeLook = false;
  // camControls.constraiHorizontal = true;
  // camControls.verticalMin = 1.3;
  // camControls.verticalMax = 1.8;
  // camControls.lon = -150;
  // camControls.lat = 120;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  let rockTexture = new THREE.TextureLoader().load(rock);
  rockTexture.wrapS = THREE.RepeatWrapping;
  rockTexture.wrapT = THREE.RepeatWrapping;

  // let diffTex = new THREE.TextureLoader().load(diff);
  // diffTex.wrapS = THREE.RepeatWrapping;
  // diffTex.wrapT = THREE.RepeatWrapping;

  const planetMaterial = new THREE.ShaderMaterial({
    uniforms: {
      skin: {
        value: rockTexture,
      },
      // diffuse: {
      //   value: diffTex,
      // }
    },
    // color: 0x0aaaaa,
    side: THREE.DoubleSide,
    // wireframe: true,
    vertexShader: vShader,
    fragmentShader: fShader,
  });

  const planet = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600, 1000, 1000),
    planetMaterial
  );

  planet.rotation.x = -Math.PI / 2;

  scene.add(planet);

  const gui = new dat.GUI();

  gui.add(settings, "horizontalSegments", 10, 3000).onChange(() => {
    planet.geometry.dispose();
    planet.geometry = new THREE.PlaneGeometry(
      600,
      600,
      settings.horizontalSegments,
      settings.verticalSegments
    );
    camControls.lookAt(new THREE.Vector3(0, 0, 0));
  });

  gui.add(settings, "verticalSegments", 10, 3000).onChange(() => {
    planet.geometry.dispose();
    planet.geometry = new THREE.PlaneGeometry(
      600,
      600,
      settings.horizontalSegments,
      settings.verticalSegments
    );
    camControls.lookAt(new THREE.Vector3(0, 0, 0));
  });

  gui.add(settings, 'allowMovement').onChange(()=>{
    camControls.activeLook = !settings.allowMovement;
    camControls.lookAt(new THREE.Vector3(0, -2400, 0))
  })


  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    camControls.update(delta);
    renderer.render(scene, camera);
  }

  animate();
};
