// cube
// d: dimension
function makeCube(d) {
    const positions = new Float32Array([
        // 0
        -d / 2,
        -d / 2,
        -d / 2,
        // 1
        d / 2,
        -d / 2,
        -d / 2,
        // 2
        d / 2,
        d / 2,
        -d / 2,
        // 3
        -d / 2,
        d / 2,
        -d / 2,
        // 4
        -d / 2,
        -d / 2,
        d / 2,
        // 5
        d / 2,
        -d / 2,
        d / 2,
        // 6
        d / 2,
        d / 2,
        d / 2,
        // 7
        -d / 2,
        d / 2,
        d / 2
    ])
    const indices = new Uint16Array([
        // Front
        4, 5, 6, 4, 6, 7,
        // Back
        1, 0, 3, 1, 3, 2,
        // Top
        3, 7, 6, 3, 6, 2,
        // Bottom
        0, 1, 5, 0, 5, 4,
        // Right
        1, 2, 6, 1, 6, 5,
        // Left
        0, 4, 7, 0, 7, 3
    ])
    const colors = new Float32Array([
        1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1
    ])
    /*const normals = new Float32Array([
        0, 0, -1,
    ])*/

    return { positions, indices, colors }
}

// sphere
function makeSphere(radius, resolution) {
    radius = Math.max(radius, 0)
    let wResolution = Math.floor(Math.min(64, Math.max(4, resolution)))
    let hResolution = Math.floor(wResolution / 2)
    let pos = [],
        nrm = [],
        tan = [],
        uv = []
    let delPhi = Math.PI / hResolution
    let delTheta = (2 * Math.PI) / wResolution
    for (let j = 1; j < hResolution; j++) {
        let phi = -Math.PI / 2 + j * delPhi
        // middle of sphere
        for (let i = 0; i < wResolution; i++) {
            let theta = i * delTheta
            let x0 = Math.cos(phi) * Math.cos(theta),
                y0 = Math.cos(phi) * Math.sin(theta),
                z0 = Math.sin(phi)
            let x1 = Math.cos(phi) * Math.cos(theta + delTheta),
                y1 = Math.cos(phi) * Math.sin(theta + delTheta),
                z1 = Math.sin(phi)
            let x2 = Math.cos(phi + delPhi) * Math.cos(theta),
                y2 = Math.cos(phi + delPhi) * Math.sin(theta),
                z2 = Math.sin(phi + delPhi)
            let x3 = Math.cos(phi + delPhi) * Math.cos(theta + delTheta),
                y3 = Math.cos(phi + delPhi) * Math.sin(theta + delTheta),
                z3 = Math.sin(phi + delPhi)

            // at theta = 0, phi = 0, tangent T = (0, 0, 1)
            // applying a rotation around the y-axis by phi then
            // a rotation around the x-axis by theta should give
            // the transformed tangent line for the new coordinate
            let tx0 = Math.cos(theta + Math.PI / 2),
                ty0 = Math.sin(theta + Math.PI / 2)
            let tx1 = Math.cos(theta + Math.PI / 2 + delTheta),
                ty1 = Math.sin(theta + Math.PI / 2 + delTheta)
            let tx2 = Math.cos(theta + Math.PI / 2),
                ty2 = Math.sin(theta + Math.PI / 2)
            let tx3 = Math.cos(theta + Math.PI / 2 + delTheta),
                ty3 = Math.sin(theta + Math.PI / 2 + delTheta)

            // 0
            pos.push(x0 * radius, y0 * radius, z0 * radius)
            nrm.push(x0, y0, z0)
            tan.push(tx0, ty0, 0)
            uv.push(i / wResolution, j / hResolution)
            // 2
            pos.push(x2 * radius, y2 * radius, z2 * radius)
            nrm.push(x2, y2, z2)
            tan.push(tx2, ty2, 0)
            uv.push(i / wResolution, (j + 1) / hResolution)
            // 1
            pos.push(x1 * radius, y1 * radius, z1 * radius)
            nrm.push(x1, y1, z1)
            tan.push(tx1, ty1, 0)
            uv.push((i + 1) / wResolution, j / hResolution)
            // 2
            pos.push(x2 * radius, y2 * radius, z2 * radius)
            nrm.push(x2, y2, z2)
            tan.push(tx2, ty2, 0)
            uv.push(i / wResolution, (j + 1) / hResolution)
            // 3
            pos.push(x3 * radius, y3 * radius, z3 * radius)
            nrm.push(x3, y3, z3)
            tan.push(tx3, ty3, 0)
            uv.push((i + 1) / wResolution, (j + 1) / hResolution)
            // 1
            pos.push(x1 * radius, y1 * radius, z1 * radius)
            nrm.push(x1, y1, z1)
            tan.push(tx1, ty1, 0)
            uv.push((i + 1) / wResolution, j / hResolution)
        }
    }

    // bottom of sphere
    let phi = -Math.PI / 2 + delPhi
    for (let i = 0; i < wResolution; i++) {
        let theta = i * delTheta
        let x1 = Math.cos(phi) * Math.cos(theta),
            y1 = Math.cos(phi) * Math.sin(theta),
            z1 = Math.sin(phi)
        let x2 = Math.cos(phi) * Math.cos(theta + delTheta),
            y2 = Math.cos(phi) * Math.sin(theta + delTheta),
            z2 = Math.sin(phi)
        let tx0 = Math.cos(theta + Math.PI / 2 + delTheta / 2),
            ty0 = Math.sin(theta + Math.PI / 2 + delTheta / 2)
        let tx1 = Math.cos(theta + Math.PI / 2),
            ty1 = Math.sin(theta + Math.PI / 2)
        let tx2 = Math.cos(theta + Math.PI / 2 + delTheta),
            ty2 = Math.sin(theta + Math.PI / 2 + delTheta)
        // 0
        pos.push(0, 0, -radius)
        nrm.push(0, 0, -1)
        tan.push(tx0, ty0, 0)
        uv.push((i + 0.5) / wResolution, 0)
        // 1
        pos.push(x1 * radius, y1 * radius, z1 * radius)
        nrm.push(x1, y1, z1)
        tan.push(tx1, ty1, 0)
        uv.push(i / wResolution, 1 / hResolution)
        // 2
        pos.push(x2 * radius, y2 * radius, z2 * radius)
        nrm.push(x2, y2, z2)
        tan.push(tx2, ty2, 0)
        uv.push((i + 1) / wResolution, 1 / hResolution)
    }

    // top of sphere
    phi = Math.PI / 2 - delPhi
    for (let i = 0; i < wResolution; i++) {
        let theta = i * delTheta
        let x1 = Math.cos(phi) * Math.cos(theta),
            y1 = Math.cos(phi) * Math.sin(theta),
            z1 = Math.sin(phi)
        let x2 = Math.cos(phi) * Math.cos(theta + delTheta),
            y2 = Math.cos(phi) * Math.sin(theta + delTheta),
            z2 = Math.sin(phi)
        let tx0 = Math.cos(theta + Math.PI / 2 + delTheta / 2),
            ty0 = Math.sin(theta + Math.PI / 2 + delTheta / 2)
        let tx1 = Math.cos(theta + Math.PI / 2),
            ty1 = Math.sin(theta + Math.PI / 2)
        let tx2 = Math.cos(theta + Math.PI / 2 + delTheta),
            ty2 = Math.sin(theta + Math.PI / 2 + delTheta)
        // 0
        pos.push(0, 0, radius)
        nrm.push(0, 0, 1)
        tan.push(tx0, ty0, 0)
        uv.push((i + 0.5) / wResolution, 1)
        // 1
        pos.push(x1 * radius, y1 * radius, z1 * radius)
        nrm.push(x1, y1, z1)
        tan.push(tx1, ty1, 0)
        uv.push(i / wResolution, 1 - 1 / hResolution)
        // 2
        pos.push(x2 * radius, y2 * radius, z2 * radius)
        nrm.push(x2, y2, z2)
        tan.push(tx2, ty2, 0)
        uv.push((i + 1) / wResolution, 1 - 1 / hResolution)
    }

    const positions = new Float32Array(pos)
    const normals = new Float32Array(nrm)
    const tangents = new Float32Array(tan)
    const uvs = new Float32Array(uv)

    return { positions, normals, tangents, uvs }
}

// prism
function makePrism(radius, height, sides) {
    sides = Math.floor(Math.max(3, sides))

    let pos = [],
        nrm = [],
        tan = [],
        uv = []
    let delTheta = (2 * Math.PI) / sides
    for (let i = 0; i < sides; i++) {
        let theta = i * delTheta
        let x0 = Math.cos(theta),
            y0 = Math.sin(theta)
        let x1 = Math.cos(theta + delTheta),
            y1 = Math.sin(theta + delTheta)

        let tx0 = Math.cos(theta + Math.PI / 2),
            ty0 = Math.sin(theta + Math.PI / 2)
        let tx1 = Math.cos(theta + delTheta + Math.PI / 2),
            ty1 = Math.sin(theta + delTheta + Math.PI / 2)

        pos.push(x0 * radius, y0 * radius, height / 2) // 0
        pos.push(x0 * radius, y0 * radius, -height / 2) // 2
        pos.push(x1 * radius, y1 * radius, height / 2) // 1
        pos.push(x0 * radius, y0 * radius, -height / 2) // 2
        pos.push(x1 * radius, y1 * radius, -height / 2) // 3
        pos.push(x1 * radius, y1 * radius, height / 2) // 1

        if (sides >= 16) {
            nrm.push(x0, y0, 0) // 0
            nrm.push(x0, y0, 0) // 2
            nrm.push(x1, y1, 0) // 1
            nrm.push(x0, y0, 0) // 2
            nrm.push(x1, y1, 0) // 3
            nrm.push(x1, y1, 0) // 1
        } else {
            let nx = Math.cos(theta + delTheta / 2),
                ny = Math.sin(theta + delTheta / 2)
            nrm.push(nx, ny, 0) // 0
            nrm.push(nx, ny, 0) // 2
            nrm.push(nx, ny, 0) // 1
            nrm.push(nx, ny, 0) // 2
            nrm.push(nx, ny, 0) // 3
            nrm.push(nx, ny, 0) // 1
        }

        tan.push(tx0, ty0, 0) // 0
        tan.push(tx0, ty0, 0) // 2
        tan.push(tx1, ty1, 0) // 1
        tan.push(tx0, ty0, 0) // 2
        tan.push(tx1, ty1, 0) // 3
        tan.push(tx1, ty1, 0) // 1

        uv.push(i / sides, 1) // 0
        uv.push(i / sides, 0) // 2
        uv.push((i + 1) / sides, 1) // 1
        uv.push(i / sides, 0) // 2
        uv.push((i + 1) / sides, 0) // 3
        uv.push((i + 1) / sides, 1) // 1
    }

    for (let i = 0; i < sides; i++) {
        let theta = i * delTheta
        let x0 = Math.cos(theta),
            y0 = Math.sin(theta)
        let x1 = Math.cos(theta + delTheta),
            y1 = Math.sin(theta + delTheta)

        // bottom
        // 0
        pos.push(0, 0, -height / 2)
        nrm.push(0, 0, -1)
        tan.push(1, 0, 0)
        uv.push(0.5, 0.5)
        // 1
        pos.push(x0 * radius, y0 * radius, -height / 2)
        nrm.push(0, 0, -1)
        tan.push(1, 0, 0)
        uv.push(x0 + 0.5, y0 + 0.5)
        // 2
        pos.push(x1 * radius, y1 * radius, -height / 2)
        nrm.push(0, 0, -1)
        tan.push(1, 0, 0)
        uv.push(x1 + 0.5, y1 + 0.5)

        // top
        // 0
        pos.push(0, 0, height / 2)
        nrm.push(0, 0, 1)
        tan.push(-1, 0, 0)
        uv.push(0.5, 0.5)
        // 1
        pos.push(x0 * radius, y0 * radius, height / 2)
        nrm.push(0, 0, 1)
        tan.push(-1, 0, 0)
        uv.push(x0 + 0.5, y0 + 0.5)
        // 2
        pos.push(x1 * radius, y1 * radius, height / 2)
        nrm.push(0, 0, 1)
        tan.push(-1, 0, 0)
        uv.push(x1 + 0.5, y1 + 0.5)
    }

    const positions = new Float32Array(pos)
    const normals = new Float32Array(nrm)
    const tangents = new Float32Array(tan)
    const uvs = new Float32Array(uv)

    return { positions, normals, tangents, uvs }
}
