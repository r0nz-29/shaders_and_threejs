import * as THREE from "three";
import * as utils from "./utils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const makeScene = (data) => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 70;
  const controls = new OrbitControls(camera, renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  function getHeightData(img, scale) {
    if (scale === undefined) scale = 1;

    var canvas = document.getElementById("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext("2d");

    var size = img.width * img.height;
    var data = new Float32Array(size);

    context.drawImage(img, 0, 0);

    for (var i = 0; i < size; i++) {
      data[i] = 0;
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    var j = 0;
    for (var i = 0; i < pix.length; i += 4) {
      var all = pix[i] + pix[i + 1] + pix[i + 2];
      data[j++] = all / (12 * scale);
    }

    return data;
  }
  let plane;
  var img = new Image();
  img.onload = function () {
    //get height data from img
    var data = getHeightData(img);

    // plane
    var geometry = new THREE.PlaneGeometry(10, 10, 9, 9);
    var texture = THREE.ImageUtils.loadTexture("./terrain.png");
    var material = new THREE.MeshLambertMaterial({ map: texture });
    plane = new THREE.Mesh(geometry, material);

    console.log(plane.geometry);
    //set height of vertices
    // for (var i = 0; i < plane.geometry.vertices.length; i++) {
    //   plane.geometry.vertices[i].z = data[i];
    // }

    scene.add(plane);
  };
  // load img source
  img.src = "terrain.png";

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
};
