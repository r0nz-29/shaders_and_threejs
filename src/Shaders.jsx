import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const vShader = `
    uniform float u_time;
    varying vec2 p;

    float plot(vec2 st) {    
      return smoothstep(0.02, 0.0, abs(st.y - st.x));
    }

    void main() {
        p = uv;
        float y = p.x;
        vec3 color = vec3(y);
        float pct = plot(p);
        color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
        float height = color.x+color.y+color.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, 0.0, height) , 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 p;

    float plot(vec2 st) {    
      return smoothstep(0.02, 0.0, abs(st.y - st.x));
    }
  
    void main() {
      float y = p.x;
      vec3 color = vec3(y);
      float pct = plot(p);
      color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
      gl_FragColor = vec4(color,1.0);
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
  camera.position.set(0, 0, 5);
  const clock = new THREE.Clock();
  const controls = new OrbitControls(camera, renderer.domElement);
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

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 5.0, 100, 100),
    material
  );

  scene.add(plane);

  function animate() {
    requestAnimationFrame(animate);
    plane.material.uniforms.u_time.value += clock.getDelta();
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
};
