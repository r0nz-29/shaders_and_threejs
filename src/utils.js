// import SimplexNoise from "simplex-noise";

// let simplex = new SimplexNoise();
// export function map(val, smin, smax, emin, emax) {
//   const t = (val - smin) / (smax - smin);
//   return (emax - emin) * t + emin;
// }
// export function noise(nx, ny) {
//   // Re-map from -1.0:+1.0 to 0.0:1.0
//   return map(simplex.noise2D(nx, ny), -1, 1, 0, 1);
// }
// //stack some noisefields together
// export function octave(nx, ny, octaves) {
//   let val = 0;
//   let freq = 1;
//   let max = 0;
//   let amp = 1;
//   for (let i = 0; i < octaves; i++) {
//     val += noise(nx * freq, ny * freq) * amp;
//     max += amp;
//     amp /= 2;
//     freq *= 2;
//   }
//   return val / max;
// }
// export function generateTexture(img, scale) {
//   if (scale == undefined) scale = 1;

//   var canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   var context = canvas.getContext("2d");

//   var size = img.width * img.height;
//   var data = new Float32Array(size);

//   context.drawImage(img, 0, 0);

//   for (var i = 0; i < size; i++) {
//     data[i] = 0;
//   }

//   var imgd = context.getImageData(0, 0, img.width, img.height);
//   var pix = imgd.data;

//   var j = 0;
//   for (var i = 0; i < pix.length; i += 4) {
//     var all = pix[i] + pix[i + 1] + pix[i + 2];
//     data[j++] = all / (12 * scale);
//   }

//   return data;
// }
