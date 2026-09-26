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

    return { positions, indices, colors }
}

// sphere
function makeSphere(radius, resolution) {
    radius = Math.max(radius, 0)
    let wResolution = Math.floor(Math.min(64, Math.max(4, resolution)))
    let hResolution = Math.floor(wResolution / 2)
    let pos = [],
        ind = [],
        col = []
    let delPhi = Math.PI / hResolution
    let delTheta = (2 * Math.PI) / wResolution
    for (let j = 1; j < hResolution; j++) {
        let phi = -Math.PI / 2 + j * delPhi
        // middle of sphere
        for (let i = 0; i < wResolution; i++) {
            let theta = i * delTheta
            let x = radius * Math.cos(phi) * Math.cos(theta),
                y = radius * Math.cos(phi) * Math.sin(theta),
                z = radius * Math.sin(phi)
            pos.push(x, y, z)
            col.push(i / wResolution, j / hResolution, 0)
            if (j > 1) {
                if (i > 0) {
                    let idx0 = (j - 2) * wResolution + i - 1,
                        idx1 = (j - 2) * wResolution + i,
                        idx2 = (j - 1) * wResolution + i - 1,
                        idx3 = (j - 1) * wResolution + i
                    ind.push(idx0, idx2, idx1)
                    ind.push(idx2, idx3, idx1)
                } else {
                    // close sphere
                    let idx0 = (j - 2) * wResolution + wResolution - 1,
                        idx1 = (j - 2) * wResolution + 0,
                        idx2 = (j - 1) * wResolution + wResolution - 1,
                        idx3 = (j - 1) * wResolution + 0
                    ind.push(idx0, idx2, idx1)
                    ind.push(idx2, idx3, idx1)
                }
            }
        }
    }

    // bottom of sphere
    pos.push(0, 0, -radius)
    col.push(0.5, 0, 0)
    let idx2 = (pos.length - 1) / 3
    for (let i = 0; i < wResolution; i++) {
        if (i > 0) {
            let idx0 = i - 1,
                idx1 = i
            ind.push(idx0, idx1, idx2)
        } else {
            // close sphere
            let idx0 = wResolution - 1,
                idx1 = 0
            ind.push(idx0, idx1, idx2)
        }
    }

    // top of sphere
    pos.push(0, 0, radius)
    col.push(1, 1, 0)
    idx2 = (pos.length - 1) / 3
    for (let i = 0; i < wResolution; i++) {
        if (i > 0) {
            let idx0 = (hResolution - 2) * wResolution + i - 1,
                idx1 = (hResolution - 2) * wResolution + i
            ind.push(idx0, idx1, idx2)
        } else {
            // close sphere
            let idx0 = (hResolution - 2) * wResolution + wResolution - 1,
                idx1 = (hResolution - 2) * wResolution + 0
            ind.push(idx0, idx1, idx2)
        }
    }

    const positions = new Float32Array(pos)
    const indices = new Uint16Array(ind)
    const colors = new Float32Array(col)

    return { positions, indices, colors }
}

// prism
function makePrism(radius, height, sides) {
    sides = Math.floor(Math.max(3, sides))

    let pos = [],
        ind = [],
        col = []
    for (let j = 0; j <= 1; j++) {
        let z = -height / 2 + j * height
        for (let i = 0; i < sides; i++) {
            let theta = i * ((2 * Math.PI) / sides)
            let x = radius * Math.cos(theta),
                y = radius * Math.sin(theta)
            pos.push(x, y, z)
            col.push(i / sides, j, 0)
            if (j > 0) {
                if (i > 0) {
                    let idx0 = (j - 1) * sides + i - 1,
                        idx1 = (j - 1) * sides + i,
                        idx2 = j * sides + i - 1,
                        idx3 = j * sides + i
                    ind.push(idx0, idx2, idx1)
                    ind.push(idx2, idx3, idx1)
                } else {
                    // close prism
                    let idx0 = (j - 1) * sides + sides - 1,
                        idx1 = (j - 1) * sides + 0,
                        idx2 = j * sides + sides - 1,
                        idx3 = j * sides + 0
                    ind.push(idx0, idx2, idx1)
                    ind.push(idx2, idx3, idx1)
                }
            }
        }
    }

    if (sides > 3) {
        // center bottom
        pos.push(0, 0, -height / 2)
        col.push(0.5, 0, 0)

        let idx2 = (pos.length - 1) / 3
        for (let i = 0; i < sides; i++) {
            if (i > 0) {
                let idx0 = i - 1,
                    idx1 = i
                ind.push(idx0, idx1, idx2)
            } else {
                // close prism
                let idx0 = sides - 1,
                    idx1 = 0
                ind.push(idx0, idx1, idx2)
            }
        }

        // center top
        pos.push(0, 0, height / 2)
        col.push(0.5, 1, 0)

        idx2 = (pos.length - 1) / 3
        for (let i = 0; i < sides; i++) {
            if (i > 0) {
                let idx0 = sides + i - 1,
                    idx1 = sides + i
                ind.push(idx0, idx1, idx2)
            } else {
                // close sphere
                let idx0 = sides + sides - 1,
                    idx1 = sides + 0
                ind.push(idx0, idx1, idx2)
            }
        }
    } else {
        // bottom
        ind.push(0, 1, 2)
        // top
        ind.push(3, 4, 5)
    }

    const positions = new Float32Array(pos)
    const indices = new Uint16Array(ind)
    const colors = new Float32Array(col)

    return { positions, indices, colors }
}
