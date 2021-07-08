import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let configs = {
  frequency: 2.0,
  amplitude: 2.0,
};

const vShader = `
    uniform float u_time;
    uniform float u_frequency;
    uniform float u_amplitude;
    varying vec2 vUV;

    // 2D Random
    float random (in vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))* 43758.5453123);
    }
  
    // 2D Noise based on Morgan McGuire @morgan3d
    // https://www.shadertoy.com/view/4dS3Wd
    float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
    }

    void main() {
        vUV = uv;
        // Scale the coordinate system to see
        // some noise in action
        vec2 pos = vec2(vUV*5.0);

        // Use the noise function
        float n = noise(pos);

        vec3 color = vec3(n);
        float height = color.x+color.y+color.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, 0.0, u_amplitude*sin(u_frequency*u_time+height)) , 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 vUV;
    void main() {
      gl_FragColor = vec4(vUV.x, vUV.y, 0.8, 1.0);
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
  camera.position.set(0, -70, 20);
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
    new THREE.PlaneGeometry(100.0, 100.0, 100, 100),
    material
  );

  scene.add(plane);

  const gui = new dat.GUI();

  gui.add(configs, "frequency", 2.0, 25.0).onChange(() => {
    plane.material.dispose();
    plane.material = new THREE.ShaderMaterial({
      // wireframe: true,
      uniforms: {
        u_time: {
          value: 0.0,
        },
        u_resolution: {
          value: new THREE.Vector2(5.0, 5.0),
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
    scene.add(plane);
  });

  gui.add(configs, "amplitude", 2.0, 50.0).onChange(() => {
    plane.material.dispose();
    plane.material = new THREE.ShaderMaterial({
      // wireframe: true,
      uniforms: {
        u_time: {
          value: 0.0,
        },
        u_resolution: {
          value: new THREE.Vector2(5.0, 5.0),
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
    scene.add(plane);
  });

  function animate() {
    requestAnimationFrame(animate);
    plane.material.uniforms.u_time.value += clock.getDelta();
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
};
