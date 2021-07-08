
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let configs = {
  frequency: 2.0,
  amplitude: 2.0,
};

const vShader = `
  varying vec2 vUV;
  // varying float color;
  uniform float u_time;
  varying vec3 finalColor;

  float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

  void main() {
    vUV = uv;
    vec3 p = position;
    vUV += vUV * abs(sin(u_time*0.1)*3.0);
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm( vUV + 0.00*u_time);
    q.y = fbm( vUV + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( vUV + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
    r.y = fbm( vUV + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

    float f = fbm(vUV+r);

    color = mix(vec3(0.101961,0.619608,0.666667),
                vec3(0.666667,0.666667,0.498039),
                clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
                vec3(0,0,0.164706),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                vec3(0.666667,1,1),
                clamp(length(r.x),0.0,1.0));

    finalColor = (f*f*f+.6*f*f+.5*f)*color;

    float height = finalColor.x + finalColor.y + finalColor.z;

    // gl_FragColor = vec4(finalColor, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( p + 12.0 * vec3(0.0, 0.0, height) , 1.0 );
  }
`;

const fShader = `
uniform float u_time;
uniform float u_frequency;
uniform float u_amplitude;
varying vec2 vUV;
// varying float color;
varying vec3 finalColor;

void main() {
  // vec3 color = vec3(vUV, 0.3);
  gl_FragColor = vec4(finalColor, 1.0);
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
  camera.position.set(0, -7, 100);
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
    new THREE.PlaneGeometry(100.0, 100.0, 500, 500),
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
