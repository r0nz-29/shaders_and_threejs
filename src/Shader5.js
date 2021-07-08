
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let configs = {
  frequency: 2.0,
  amplitude: 2.0,
};

const vShader = `
    uniform float u_time;
    uniform float u_frequency;
    uniform float u_amplitude;
    uniform vec2 u_resolution;
    varying vec2 vUV;

    vec2 random2(vec2 st){
      st = vec2( dot(st,vec2(127.1,311.7)),
      dot(st,vec2(269.5,183.3)) );
      return -1.0 + 2.0*fract(sin(st)*43758.5453123);
  }
  
  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                       dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                  mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                       dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
  }
  

    void main() {
      vUV = uv;  
    
      vec3 color = vec3(0.0);

      vec2 pos = vec2(vUV*10.0);

      vec3 finalColor = vec3(noise(2.0*sin(u_time+pos)));

      float height = finalColor.x+finalColor.y+finalColor.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * height , 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 vUV;

    vec2 random2(vec2 st){
      st = vec2( dot(st,vec2(127.1,311.7)),
      dot(st,vec2(269.5,183.3)) );
      return -1.0 + 2.0*fract(sin(st)*43758.5453123);
    }
  
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
  
      vec2 u = f*f*(3.0-2.0*f);
  
      return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                       dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                  mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                       dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }

    void main() {
    vec2 uv = vUV;
    
    vec3 color = vec3(0.0);

    vec2 pos = vec2(uv*10.0);

    color = vec3( noise(2.0*sin(pos+u_time))*.5+.5 );

    gl_FragColor = vec4(color * vec3(uv, sin(2.0*u_time)), 1.0);

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
  camera.position.set(0, -7, 10);
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
        value: new THREE.Vector2(10.0, 10.0),
      },
      u_frequency: {
        value: configs.frequency,
      },
      u_amplitude: {
        value: configs.amplitude,
      },
    },
    side: THREE.DoubleSide,
    vertexShader: vShader,
    fragmentShader: fShader,
  });

  const plane = new THREE.Mesh(
    new THREE.IcosahedronGeometry(50.0, 500),
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
