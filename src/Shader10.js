import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const vShader = `
    uniform float u_time;
    varying vec2 vUV;
    varying float color;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float level(vec2 st) {
    float n = 0.0;
    for (float i = 1.0; i < 8.0; i ++) {
        float m = pow(2.0, i);
        n += snoise(st * m) * (1.0 / m);
    }
    return n * 0.5 + 0.5;
}

vec3 Normal(vec2 st) {
    float d = 0.0001;
    float l0 = level(st);
    float l1 = level(st + vec2(d, 0.0)); // slightly offset the x-coord
    float l2 = level(st + vec2(0.0, d)); // slightly offset the y-coord
    // return normalized vector perpendicular to the surface using the noise values as the elevation of these points
    return normalize(vec3(-(l1 - l0), -(l2 - l0), d));
}

//https://en.wikipedia.org/wiki/Phong_reflection_model
vec3 phong(vec2 st, vec3 normal, vec3 lightPos) {
    vec3 lightDir = normalize(vec3(lightPos - vec3(st, 0.0)));
    float diffuse = max(0.0, dot(normal, lightDir));
    vec3 vReflection = normalize(reflect(-lightDir, normal));
    float specular = pow(max(0.0, dot(normal, vReflection)), 8.0);
    vec3 ambientColor = vec3(0.1,0.0,0.2);
    vec3 diffuseColor = vec3(0.0,0.5,0.2);
    return min(vec3(1.0), ambientColor + diffuseColor * diffuse + specular);
}


    void main() {
        vUV = uv;
        float t = u_time;
        // color = phong(vUV, Normal(vUV), vec3(cos(t) * 0.5 + 0.5, sin(t) * 0.5 + 0.5, 1.0));
        // water if the elevation is less than a threshold
        color = snoise(vUV*2.0);
        float n = level(vUV);
        if (n < 0.4) {color = 0.2;}
        // gl_FragColor = vec4(color, 1.0);
        // float height = color.x + color.y + color.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, 0.0, color), 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 vUV;
    varying float color;

    void main() {
      gl_FragColor = vec4(vec3(color), 1.0);
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
    new THREE.PlaneGeometry(5.0, 5.0, 500, 500),
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
