// --- Triangle ---
const sideA = 1.;
const sideC = sideA/Math.tan(60*(Math.PI/180));
const sideB = -sideC;
const positions = new Float32Array([
    0.0, sideA, 0.0, // vertex 1
    sideB, 0.0, 0.0, // vertex 2
    sideC, 0.0, 0.0 // vertex 3
]);

const colors = new Float32Array([
    1.0, 0.0, 0.0, // Red
    0.0, 1.0, 0.0, // Green
    0.0, 0.0, 1.0 // Blue
]);
