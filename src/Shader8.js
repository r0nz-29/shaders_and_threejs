import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const vShader = `
    uniform float u_time;
    varying vec2 vUV;
    varying vec2 p;
    varying vec3 color;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
    
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                            -0.577350269189626,
                            0.024390243902439);
    
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
    
        vec2 i1 = vec2(0.0);
        i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
        vec2 x1 = x0.xy + C.xx - i1;
        vec2 x2 = x0.xy + C.zz;
    
    
        i = mod289(i);
        vec3 p = permute(
                permute( i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
    
        vec3 m = max(0.5 - vec3(
                            dot(x0,x0),
                            dot(x1,x1),
                            dot(x2,x2)
                            ), 0.0);
    
        m = m*m ;
        m = m*m ;
    
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
    
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
    
        vec3 g = vec3(0.0);
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
        return 130.0 * dot(m, g);
    }
    
    #define OCTAVES 5
    
    float ridge(float h, float offset) {
        h = abs(h);     
        h = offset - h; 
        h = h * h / 2.0;
        return h;
    }
    
    float ridgedMF(vec2 p) {
        float lacunarity = 2.0;
        float gain = 0.5;
        float offset = 0.9;
    
        float sum = 0.0;
        float freq = 1.0, amp = 0.5;
        float prev = 1.0;
        for(int i=0; i < OCTAVES; i++) {
            float n = ridge(snoise(p*freq), offset);
            sum += n*amp;
            sum += n*amp*prev;  
            prev = n;
            freq *= lacunarity;
            amp *= gain;
        }
        return sum;
    }

    void main() {
        vUV = uv;
        vec3 p = position;
        color = vec3(0.0);
        color += ridgedMF(vUV*3.0);
        // color -= vec3(0.3, 0.3, 0.3);
        float height = color.x + color.y + color.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p + vec3(0.0, 0.0, height) , 1.0);
    }
`;

const fShader = `
    uniform float u_time;
    varying vec2 vUV;
    varying vec3 color;
  
    void main() {
      gl_FragColor = vec4(vec3(color),1.0);
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
    new THREE.PlaneGeometry(10.0, 10.0, 700, 700),
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
