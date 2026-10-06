class Object {
    constructor(positions, colors, indices) {
        this.positions = positions
        this.colors = colors
        this.indices = indices

        this.children = []
        this.parent = undefined

        this.matrix = mat4Identity()
        this.modelMatrix = mat4Identity()

        this.scale = { x: 1, y: 1, z: 1 }
        this.translation = { x: 0, y: 0, z: 0 }
        this.rotation = { x: 0, y: 0, z: 0 }
    }

    initBuffers(gl) {
        this.positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW)

        this.colorBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW)

        this.indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
    }

    updateMatrix() {
        // Model Matrix = T • R • S • I
        // Scaling
        this.matrix = [this.scale.x, 0, 0, 0, 0, this.scale.y, 0, 0, 0, 0, this.scale.z, 0, 0, 0, 0, 1]

        // Rotation
        let cx = Math.cos(this.rotation.y), sx = Math.sin(this.rotation.y)
        let cy = Math.cos(this.rotation.x), sy = Math.sin(this.rotation.x)
        let cz = Math.cos(this.rotation.z), sz = Math.sin(this.rotation.z)
        let rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1]
        let rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1]
        let rotZ = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

        this.matrix = multiplyMat4(multiplyMat4(rotZ, multiplyMat4(rotY, rotX)), this.matrix)

        // Translation
        this.matrix[12] = this.translation.x
        this.matrix[13] = this.translation.y
        this.matrix[14] = this.translation.z
    }

    updateModelMatrix() {
        // update this object with respect to its parent's reference frame
        if(this.parent) {
            this.modelMatrix = multiplyMat4(this.parent.modelMatrix, this.matrix)
        } else {
            this.modelMatrix = this.matrix
        }

        // update this object's childrens' reference frames
        for(let i in this.children) {
            this.children[i].updateModelMatrix()
        }
    }
}

class Shader {
    constructor(gl, vertexShader, fragmentShader, uniforms={}, attributes={"position":"", "color":"", "normal":""}) {
        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader
        this.uniforms = uniforms

        this.initialize(gl)
    }

    initialize(gl) {
        this.program = createProgram(gl, this.vertexShader, this.fragmentShader)
        gl.useProgram(this.program)

        this.updateAttributeLocations(gl)
        this.updateUniformLocations(gl)
    }

    updateAttributeLocations(gl) {
        this.attribLocations = {}
        for(let i in this.uniforms) {
            this.attribLocations[i] = gl.getUniformLocation(this.program, this.attributes[i])
        }
    }

    updateUniformLocations(gl) {
        this.uniformLocations = {}
        for(let i in this.uniforms) {
            this.uniformLocations[i] = gl.getUniformLocation(this.program, this.uniforms[i])
        }
    }

    createProgram(gl, vsSource, fsSource) {
      let vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      let fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      let prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog));
      }
      return prog;
    }

    createShader(gl, type, source) {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }
}