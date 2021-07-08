import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const vShader = `
uniform float u_time;
varying vec3 n;
void main() {
  n = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(normal, 1.0);
}
`;

//position is a vec3

const fShader = `
uniform float u_time;
varying vec3 n;
void main() {
  gl_FragColor = vec4(n, 1.0);
}
`;

export const makeScene = () => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 10;
  const controls = new OrbitControls(camera, renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4, 10, 10),
    new THREE.ShaderMaterial({
      uniforms: {
        u_time: {
          value: 0.0,
        },
      },
      vertexShader: vShader,
      fragmentShader: fShader,
      side: THREE.DoubleSide,
    })
  );

  scene.add(plane);

  // scene.add(plane);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.x = 0;
  light.position.y = 0;
  light.position.z = 10;
  scene.add(light);
  console.log(plane);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    plane.material.uniforms.u_time.value += 0.1;
    // console.log(sphere.material);
    renderer.render(scene, camera);
  }
  animate();
};
