const canvas = document.getElementById("glcanvas")
const gl = canvas.getContext("webgl2")

function compile(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader))
    return shader
}

function createProgram(vsSource, fsSource) {
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource))
    gl.bindAttribLocation(prog, 0, "position")
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(prog))
    return prog
}

const fragEditor = document.getElementById("fragEditor")
const shaderError = document.getElementById("shaderError")
fragEditor.value = rayFragmentShader

let program
function updateProgram() {
    try {
        const prog = createProgram(rayVertexShader, fragEditor.value)
        gl.deleteProgram(program)
        program = prog
        gl.useProgram(program)
        shaderError.textContent = ""
    } catch (e) {
        shaderError.textContent = e.message.replace(/\0/g, "")
    }
}
updateProgram()
fragEditor.addEventListener("input", updateProgram)

gl.bindVertexArray(gl.createVertexArray())
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
)
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(0)

const bounces = document.getElementById("bounces")
const ambient = document.getElementById("ambient")
for (const slider of [bounces, ambient]) {
    slider.addEventListener(
        "input",
        () =>
            (document.getElementById(slider.id + "Value").textContent =
                slider.value)
    )
}

// Dragging orbits the camera
let pitch = 0,
    yaw = 0
canvas.addEventListener("pointerdown", (e) =>
    canvas.setPointerCapture(e.pointerId)
)
canvas.addEventListener("pointermove", (e) => {
    if (!canvas.hasPointerCapture(e.pointerId)) return
    yaw -= e.movementX * 0.01
    pitch = Math.min(1.4, Math.max(-0.2, pitch + e.movementY * 0.01))
})

function render(time) {
    requestAnimationFrame(render)
    if (!program) return

    const uniform = (name) => gl.getUniformLocation(program, name)
    gl.uniform1f(uniform("u_time"), time / 1000)
    gl.uniform2f(uniform("u_resolution"), canvas.width, canvas.height)
    gl.uniform1i(uniform("u_maxBounces"), bounces.value)
    gl.uniform1f(uniform("u_ambientStrength"), ambient.value)
    gl.uniform2f(uniform("u_cameraOrbit"), pitch, yaw)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
requestAnimationFrame(render)
