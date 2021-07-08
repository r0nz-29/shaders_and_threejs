import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const vShader = `
    uniform float u_time;
    varying vec2 vuv; 
    varying vec3 np;
    varying vec3 color;

    vec3 getNormalizedVec (vec3 pos) {
      float length = sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
      return vec3(pos.x/length, pos.y/length, pos.z/length);
    }


    void main() {
      vuv = uv;
      np = getNormalizedVec(position);
      float pct = 0.0;
      pct = smoothstep(0.0, 1.0, distance(uv*10.0, vec2(0.5)))+smoothstep(0.0, 1.0, distance(uv*10.0, vec2(5.0)))+smoothstep(0.0, 1.0, distance(uv*10.0, vec2(4.0, 0.9)));
      // if(uv.y < 0.25){ pct = 0.3 ;}
      color = vec3(pct);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position - normal * pct, 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 vuv;
    varying vec3 np;
    varying vec3 color;

    void main() {
      gl_FragColor = vec4(vec3(vuv, 0.3),1.0);
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
  camera.position.set(0, 0, 10);
  const clock = new THREE.Clock();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const material = new THREE.ShaderMaterial({
    // wireframe: true,
    uniforms: {
      u_time: {
        value: 0.0,
      },
      u_resolution: {
        value: new THREE.Vector2(5.0, 5.0),
      },
    },
    side: THREE.DoubleSide,
    vertexShader: vShader,
    fragmentShader: fShader,
  });

  const ball = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, 100, 100),
    material
  );

  scene.add(ball);
    console.log(ball.geometry)
  function animate() {
    requestAnimationFrame(animate);
    ball.material.uniforms.u_time.value += clock.getDelta();
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
};
