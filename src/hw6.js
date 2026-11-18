// WebGL setup
const canvas = document.getElementById("glcanvas")
const container = document.getElementById("glcanvas-container")
const gl = canvas.getContext("webgl2")
if (!gl) alert("WebGL2 not supported")

let vertEditor = document.getElementById("vertEditor")
let fragEditor = document.getElementById("fragEditor")
vertEditor.value = vertexShader
fragEditor.value = fragmentShader

let objSelectors = [
    document.getElementById("segA"),
    document.getElementById("segB"),
    document.getElementById("segC"),
    document.getElementById("segD"),
    document.getElementById("segE")
]

let shader = new Shader(gl, vertEditor.value, fragEditor.value, {
    uTime: { type: "float", value: 0 }
})

let segmentA = new Object(gl, {
    ...makeSphere(2, 32),
    dColor: [1, 0.451, 0.808],
    shininess: 10,
    bumpSrc: "img/201_norm.jpg",
    texSrc: "img/201.jpg"
})
segmentA.name = "Segment A"

let pntsB = makePrism(1, 5, 32)
let cx = Math.cos(Math.PI / 2),
    sx = Math.sin(Math.PI / 2)
for (let i = 0; i < pntsB.positions.length / 3; i++) {
    let ny = pntsB.normals[i * 3 + 1]
    let nz = pntsB.normals[i * 3 + 2]
    let y = pntsB.positions[i * 3 + 1]
    let z = pntsB.positions[i * 3 + 2]

    pntsB.positions[i * 3 + 1] = cx * y - sx * z + 2.5
    pntsB.positions[i * 3 + 2] = sx * y + cx * z
    pntsB.normals[i * 3 + 1] = cx * ny - sx * nz
    pntsB.normals[i * 3 + 2] = sx * ny + cx * nz
}
let segmentB = new Object(gl, {
    ...pntsB,
    dColor: [1, 0.816, 0],
    shininess: 1,
    bumpSrc: "img/202_norm.jpg",
    texSrc: "img/202.jpg"
})
segmentB.name = "Segment B"
segmentB.translation.y = 2
segmentB.updateMatrix()
segmentA.add(segmentB)

let pntsC = makePrism(0.75, 6, 32)
for (let i = 0; i < pntsC.positions.length / 3; i++) {
    let ny = pntsC.normals[i * 3 + 1]
    let nz = pntsC.normals[i * 3 + 2]
    let y = pntsC.positions[i * 3 + 1]
    let z = pntsC.positions[i * 3 + 2]

    pntsC.positions[i * 3 + 1] = cx * y - sx * z + 2.5
    pntsC.positions[i * 3 + 2] = sx * y + cx * z
    pntsC.normals[i * 3 + 1] = cx * ny - sx * nz
    pntsC.normals[i * 3 + 2] = sx * ny + cx * nz
}
let segmentC = new Object(gl, {
    ...pntsC,
    dColor: [0.392, 1, 0.392],
    shininess: 20,
    bumpSrc: "img/203_norm.jpg",
    texSrc: "img/203.jpg"
})
segmentC.name = "Segment C"
segmentC.translation.y = 5
segmentC.updateMatrix()
segmentB.add(segmentC)

let pntsD = makePrism(0.75, 6, 32)
for (let i = 0; i < pntsD.positions.length / 3; i++) {
    let ny = pntsD.normals[i * 3 + 1]
    let nz = pntsD.normals[i * 3 + 2]
    let y = pntsD.positions[i * 3 + 1]
    let z = pntsD.positions[i * 3 + 2]

    pntsD.positions[i * 3 + 1] = cx * y - sx * z + 2.5
    pntsD.positions[i * 3 + 2] = sx * y + cx * z
    pntsD.normals[i * 3 + 1] = cx * ny - sx * nz
    pntsD.normals[i * 3 + 2] = sx * ny + cx * nz
}
let segmentD = new Object(gl, {
    ...pntsD,
    dColor: [0.188, 0.69, 1],
    shininess: 50,
    bumpSrc: "img/204_norm.jpg",
    texSrc: "img/204.jpg"
})
segmentD.name = "Segment D"
segmentD.translation.y = 6
segmentD.updateMatrix()
segmentC.add(segmentD)
let segmentE = new Object(gl, {
    ...makeSphere(1.5, 16),
    dColor: [0.761, 0.471, 1],
    shininess: 100,
    bumpSrc: "img/205_norm.jpg",
    texSrc: "img/205.jpg"
})
segmentE.name = "SegmentE"
segmentE.translation.y = 7.5
segmentE.scale.z = 0.25
segmentE.updateMatrix()
segmentD.add(segmentE)
let objects = [segmentA, segmentB, segmentC, segmentD, segmentE]

let activeObj
let activeIdx = 0
function setActiveSegment(idx) {
    objSelectors[activeIdx].style.backgroundColor = ""
    activeIdx = idx
    activeObj = objects[idx]
    objSelectors[activeIdx].style.backgroundColor = "#444444"
    document.getElementById("xRot").value = activeObj.rotation.x
    document.getElementById("yRot").value = activeObj.rotation.y
    document.getElementById("zRot").value = activeObj.rotation.z
    document.getElementById("aColor").value = activeObj.aColor[0]
    document.getElementById("sColor").value = activeObj.sColor[0]
    document.getElementById("shininess").value = activeObj.shininess
    document.getElementById("bumpScale").value = activeObj.bumpScale
    setTextureMappingMode()
}
setActiveSegment(activeIdx)

function setTextureMappingMode(mode) {
    if (mode !== undefined) {
        if (activeObj.textureMode === mode) {
            activeObj.textureMode = -1
        } else {
            activeObj.textureMode = mode
        }
    }
    if (activeObj.textureMode === -1) {
        document.getElementById("colorMode").style.backgroundColor = "#444444"
        document.getElementById("bumpMode").style.backgroundColor = ""
        document.getElementById("normalMode").style.backgroundColor = ""
    } else if (activeObj.textureMode === 0) {
        document.getElementById("colorMode").style.backgroundColor = ""
        document.getElementById("bumpMode").style.backgroundColor = "#444444"
        document.getElementById("normalMode").style.backgroundColor = ""
    } else {
        document.getElementById("colorMode").style.backgroundColor = ""
        document.getElementById("bumpMode").style.backgroundColor = ""
        document.getElementById("normalMode").style.backgroundColor = "#444444"
    }
}

function updateObj() {
    activeObj.rotation.x = Number(document.getElementById("xRot").value)
    activeObj.rotation.y = Number(document.getElementById("yRot").value)
    activeObj.rotation.z = Number(document.getElementById("zRot").value)
    let a = Number(document.getElementById("aColor").value)
    activeObj.aColor = [a, a, a]
    let s = Number(document.getElementById("sColor").value)
    activeObj.sColor = [s, s, s]
    activeObj.shininess = Number(document.getElementById("shininess").value)
    activeObj.bumpScale = Number(document.getElementById("bumpScale").value)
    activeObj.updateMatrix()
}

function initShaderProgram() {
    try {
        shader.vertexShader = vertEditor.value
        shader.fragmentShader = fragEditor.value
        shader.initialize(gl)
    } catch (e) {
        console.error(e)
    }
}
initShaderProgram()
vertEditor.onkeyup = initShaderProgram
fragEditor.onkeyup = initShaderProgram

// Mouse and keyboard interactions
let mouseDown = false,
    lastX,
    lastY

canvas.addEventListener("mousedown", (e) => {
    mouseDown = true
    lastX = e.clientX
    lastY = e.clientY
})
canvas.addEventListener("mouseup", () => (mouseDown = false))
canvas.addEventListener("mousemove", (e) => {
    if (!mouseDown || !activeObj) return
    let dx = e.clientX - lastX
    let dy = e.clientY - lastY
    if (e.shiftKey) {
        let xPos = Math.min(
            20,
            Math.max(
                -20,
                Number(document.getElementById("xPos").value) + dx * 0.01
            )
        )
        let yPos = Math.min(
            20,
            Math.max(
                -20,
                Number(document.getElementById("yPos").value) - dy * 0.01
            )
        )
        document.getElementById("xPos").value = xPos
        document.getElementById("yPos").value = yPos
        activeObj.translation.x = xPos
        activeObj.translation.y = yPos
        activeObj.updateMatrix()
    } else {
        let xRot =
            (Number(document.getElementById("xRot").value) + dy * 0.01) %
            (2 * Math.PI)
        let yRot =
            (Number(document.getElementById("yRot").value) + dx * 0.01) %
            (2 * Math.PI)
        xRot = xRot < 0 ? 2 * Math.PI + xRot : xRot
        yRot = yRot < 0 ? 2 * Math.PI + yRot : yRot
        document.getElementById("xRot").value = xRot
        document.getElementById("yRot").value = yRot
        activeObj.rotation.x = xRot
        activeObj.rotation.y = yRot
        activeObj.updateMatrix()
    }
    lastX = e.clientX
    lastY = e.clientY
})

// Projection setup
let fov = Math.PI / 4,
    aspect = canvas.width / canvas.height,
    near = 0.1,
    far = 1000
let orthoSize = 2.5

let camera = new PerspectiveCamera({ fov, aspect, near, far })
//let camera = new OrthographicCamera({orthoSize, aspect, near, far})
camera.translation.z = -50
camera.updateModelViewMatrix()

let onresize = () => {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
}
onresize()

document.addEventListener("keydown", (e) => {
    const step = 0.2
    switch (e.code) {
        case "ArrowUp":
            camera.translation.y -= step
            break
        case "ArrowDown":
            camera.translation.y += step
            break
        case "ArrowLeft":
            camera.translation.x += step
            break
        case "ArrowRight":
            camera.translation.x -= step
            break
        case "KeyW":
            camera.translation.z += step
            break
        case "KeyS":
            camera.translation.z -= step
            break
    }
    camera.updateModelViewMatrix()
})

let startTime = Date.now()

function render() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // set uniform delta time
    shader.uniforms["uTime"].value = (Date.now() - startTime) / 1000

    shader.render(gl, objects, camera)

    requestAnimationFrame(render)
}

// Initialize when page loads
render()
