// cube
/*const positions = new Float32Array([
  -1, -1, -1,  // 0
   1, -1, -1,  // 1
   1,  1, -1,  // 2
  -1,  1, -1,  // 3
  -1, -1,  1,  // 4
   1, -1,  1,  // 5
   1,  1,  1,  // 6
  -1,  1,  1   // 7
]);

const colors = new Float32Array([
  1,0,0,  0,1,0,  0,0,1, 1,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,1
]);

const indices = new Uint16Array([
  // Front
  4, 5, 6,   4, 6, 7,
  // Back
  1, 0, 3,   1, 3, 2,
  // Top
  3, 7, 6,   3, 6, 2,
  // Bottom
  0, 1, 5,   0, 5, 4,
  // Right
  1, 2, 6,   1, 6, 5,
  // Left
  0, 4, 7,   0, 7, 3,
]);*/

function makeRectangularPrism(w, h, d) {
  const positions = new Float32Array([
    -w/2, -h/2, -d/2, // 0
     w/2, -h/2, -d/2, // 1
     w/2,  h/2, -d/2, // 2
    -w/2,  h/2, -d/2, // 3
    -w/2, -h/2,  d/2, // 4
     w/2, -h/2,  d/2, // 5
     w/2,  h/2,  d/2, // 6
    -w/2,  h/2,  d/2, // 7
  ])
  const indices = new Uint16Array([
    // Front
    4, 5, 6,   4, 6, 7,
    // Back
    1, 0, 3,   1, 3, 2,
    // Top
    3, 7, 6,   3, 6, 2,
    // Bottom
    0, 1, 5,   0, 5, 4,
    // Right
    1, 2, 6,   1, 6, 5,
    // Left
    0, 4, 7,   0, 7, 3,
  ])

  const colors = new Float32Array([
    1,0,0,  0,1,0,  0,0,1, 1,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,1
  ]);

  return {positions, indices, colors}
}

function makeSphere(r, ) {}