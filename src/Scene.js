import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import globe from "./maps/terrain.png";

// const rand_range = (lower, upper) => {
//   return Math.random() * (upper - lower) + lower;
// };

const FS = `
uniform sampler2D globe;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
  vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
  gl_FragColor = vec4(texture2D(globe, vertexUV).xyz, 1.0);
  // gl_FragColor = vec4(0.0, 0.3, 0.8, 1.0);
}
`;
const VS = `
uniform sampler2D globe;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  vertexUV = uv;
  vertexNormal = normal;
  vec3 rgb = texture2D(globe, vertexUV).xyz;
  float height = rgb.x + rgb.y + rgb.z;
  vec3 direction = normalize(normal - position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position - direction * rgb, 1.0);
}`;

// console.log(VS);
export const makeScene = () => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 10;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // controls.autoRotate = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 100, 100),
    new THREE.ShaderMaterial({
      vertexShader: VS,
      fragmentShader: FS,
      // wireframe: true,
      uniforms: {
        globe: {
          value: new THREE.TextureLoader().load(globe),
        },
      },
    })
  );
  scene.add(sphere);

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};
