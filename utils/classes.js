class Node {
    constructor() {
        this.parent = undefined
        this.children = []

        this.matrix = mat4Identity()
        this.modelMatrix = mat4Identity()
        this.normalMatrix = mat4Identity()

        this.scale = { x: 1, y: 1, z: 1 }
        this.translation = { x: 0, y: 0, z: 0 }
        this.rotation = { x: 0, y: 0, z: 0 }
    }

    add(node) {
        if (node.parent) {
            throw new Error(
                "Cannot add node, node already has a parent.",
                this,
                node
            )
        }
        if (!this.children.includes(node)) {
            this.children.push(node)
            node.parent = this
            node.updateModelMatrix()
        }
    }

    updateMatrix() {
        // Model Matrix = T • R • S • I
        // Scaling
        this.matrix = [
            this.scale.x,
            0,
            0,
            0,
            0,
            this.scale.y,
            0,
            0,
            0,
            0,
            this.scale.z,
            0,
            0,
            0,
            0,
            1
        ]

        // Rotation
        let cx = Math.cos(this.rotation.x),
            sx = Math.sin(this.rotation.x)
        let cy = Math.cos(this.rotation.y),
            sy = Math.sin(this.rotation.y)
        let cz = Math.cos(this.rotation.z),
            sz = Math.sin(this.rotation.z)
        let rotX = [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1]
        let rotY = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]
        let rotZ = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

        this.matrix = multiplyMat4(
            multiplyMat4(rotZ, multiplyMat4(rotY, rotX)),
            this.matrix
        )

        // Translation
        this.matrix[12] = this.translation.x
        this.matrix[13] = this.translation.y
        this.matrix[14] = this.translation.z

        this.updateModelMatrix()
    }

    updateModelMatrix() {
        // update this node with respect to its parent's reference frame
        if (this.parent) {
            this.modelMatrix = multiplyMat4(
                this.parent.modelMatrix,
                this.matrix
            )
        } else {
            this.modelMatrix = [...this.matrix]
        }
        this.normalMatrix = transpose(invert(this.modelMatrix, 4), 4)

        // update this node's childrens' reference frames
        for (let i in this.children) {
            this.children[i].updateModelMatrix()
        }
    }
}

class Object extends Node {
    constructor(
        gl,
        {
            uvs,
            colors,
            indices,
            normals,
            tangents,
            positions,
            shininess,
            bumpScale,
            aColor,
            dColor,
            sColor,
            textureMode,
            texSrc,
            bumpSrc
        }
    ) {
        super()

        this.uvs = uvs
        this.colors = colors
        this.indices = indices
        this.normals = normals
        this.tangents = tangents
        this.positions = positions

        this.aColor = aColor || [1.0, 1.0, 1.0]
        this.dColor = dColor || [1.0, 1.0, 1.0]
        this.sColor = sColor || [1.0, 1.0, 1.0]
        this.shininess = shininess || 1.0

        this.textureMode = textureMode !== undefined ? textureMode : 0
        if (texSrc) {
            this.textureElement = document.createElement("img")
            this.textureElement.crossOrigin = "anonymous"
            this.textureElement.src = texSrc
        }
        if (bumpSrc) {
            this.bumpElement = document.createElement("img")
            this.bumpElement.crossOrigin = "anonymous"
            this.bumpElement.src = bumpSrc
        }
        this.bumpScale = bumpScale || 6

        this.children = []
        this.parent = undefined

        this.show = true

        this.initBuffers(gl)
    }

    initBuffers(gl) {
        this.positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW)

        if (this.colors) {
            this.colorBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW)
        }

        if (this.normals) {
            this.normalBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW)
        }

        if (this.tangents) {
            this.tangentBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.tangents, gl.STATIC_DRAW)
        }

        if (this.uvs) {
            this.uvBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW)
        }

        if (this.indices) {
            this.indexBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
        }

        if (this.textureElement) {
            this.textureElement.onload = () => {
                this.texture = gl.createTexture()
                gl.bindTexture(gl.TEXTURE_2D, this.texture)
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    this.textureElement
                )
            }
        }

        if (this.bumpElement) {
            this.bumpElement.onload = () => {
                this.bumpTexture = gl.createTexture()
                gl.bindTexture(gl.TEXTURE_2D, this.bumpTexture)
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    this.bumpElement
                )
            }
        }
    }
}

class OrthographicCamera {
    constructor({ orthoSize, aspect, near, far }) {
        this.orthoSize = orthoSize
        this.aspect = aspect
        this.near = near
        this.far = far

        this.translation = { x: 0, y: 0, z: 0 }
        this.rotation = { x: 0, y: 0, z: 0 }

        this.updateModelViewMatrix()
        this.updateProjectionMatrix()
    }

    updateProjectionMatrix() {
        this.projectionMatrix = matMul(
            box2Cube(
                -this.orthoSize * this.aspect,
                this.orthoSize * this.aspect,
                -this.orthoSize,
                this.orthoSize,
                this.near,
                this.far
            ),
            flipZ()
        )
    }

    updateModelViewMatrix() {
        // Rotation
        let cx = Math.cos(this.rotation.y),
            sx = Math.sin(this.rotation.y)
        let cy = Math.cos(this.rotation.x),
            sy = Math.sin(this.rotation.x)
        let cz = Math.cos(this.rotation.z),
            sz = Math.sin(this.rotation.z)
        let rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1]
        let rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1]
        let rotZ = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

        this.modelViewMatrix = multiplyMat4(
            multiplyMat4(rotZ, multiplyMat4(rotY, rotX)),
            mat4Identity()
        )

        // Translation
        this.modelViewMatrix[12] = this.translation.x
        this.modelViewMatrix[13] = this.translation.y
        this.modelViewMatrix[14] = this.translation.z
    }
}

class PerspectiveCamera {
    constructor({ fov, aspect, near, far }) {
        this.fov = fov
        this.aspect = aspect
        this.near = near
        this.far = far

        this.translation = { x: 0, y: 0, z: 0 }
        this.rotation = { x: 0, y: 0, z: 0 }

        this.updateModelViewMatrix()
        this.updateProjectionMatrix()
    }

    updateProjectionMatrix() {
        this.projectionMatrix = perspective(
            this.fov,
            this.aspect,
            this.near,
            this.far
        )
    }

    updateModelViewMatrix() {
        // Rotation
        let cx = Math.cos(this.rotation.y),
            sx = Math.sin(this.rotation.y)
        let cy = Math.cos(this.rotation.x),
            sy = Math.sin(this.rotation.x)
        let cz = Math.cos(this.rotation.z),
            sz = Math.sin(this.rotation.z)
        let rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1]
        let rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1]
        let rotZ = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

        this.modelViewMatrix = multiplyMat4(
            multiplyMat4(rotZ, multiplyMat4(rotY, rotX)),
            mat4Identity()
        )

        // Translation
        this.modelViewMatrix[12] = this.translation.x
        this.modelViewMatrix[13] = this.translation.y
        this.modelViewMatrix[14] = this.translation.z
    }
}

class Shader {
    constructor(gl, vertexShader, fragmentShader, uniforms = {}, options = {}) {
        this.vertexShader = vertexShader
        this.fragmentShader = fragmentShader
        this.uniforms = uniforms
        this.mode = options.mode || gl.TRIANGLES

        this.initialize(gl)
    }

    initialize(gl) {
        this.program = this.createProgram(
            gl,
            this.vertexShader,
            this.fragmentShader
        )
        gl.useProgram(this.program)

        this.updateAttributeLocations(gl)
        this.updateUniformLocations(gl)
    }

    updateAttributeLocations(gl) {
        this.posLoc = gl.getAttribLocation(this.program, "position")
        this.colorLoc = gl.getAttribLocation(this.program, "color")
        this.normLoc = gl.getAttribLocation(this.program, "normal")
        this.tanLoc = gl.getAttribLocation(this.program, "tangent")
        this.uvLoc = gl.getAttribLocation(this.program, "uv")
    }

    updateUniformLocations(gl) {
        this.uniformLocations = {}
        this.uniformLocations["modelViewMatrix"] = gl.getUniformLocation(
            this.program,
            "modelViewMatrix"
        )
        this.uniformLocations["projectionMatrix"] = gl.getUniformLocation(
            this.program,
            "projectionMatrix"
        )
        this.uniformLocations["modelMatrix"] = gl.getUniformLocation(
            this.program,
            "modelMatrix"
        )
        this.uniformLocations["normalMatrix"] = gl.getUniformLocation(
            this.program,
            "normalMatrix"
        )
        this.uniformLocations["shininess"] = gl.getUniformLocation(
            this.program,
            "shininess"
        )
        this.uniformLocations["bumpScale"] = gl.getUniformLocation(
            this.program,
            "bumpScale"
        )
        this.uniformLocations["aColor"] = gl.getUniformLocation(
            this.program,
            "aColor"
        )
        this.uniformLocations["dColor"] = gl.getUniformLocation(
            this.program,
            "dColor"
        )
        this.uniformLocations["sColor"] = gl.getUniformLocation(
            this.program,
            "sColor"
        )
        this.uniformLocations["textureMode"] = gl.getUniformLocation(
            this.program,
            "textureMode"
        )
        this.uniformLocations["uTexture"] = gl.getUniformLocation(
            this.program,
            "uTexture"
        )
        this.uniformLocations["uBumpTexture"] = gl.getUniformLocation(
            this.program,
            "uBumpTexture"
        )
        for (let i in this.uniforms) {
            this.uniformLocations[i] = gl.getUniformLocation(this.program, i)
        }
    }

    createProgram(gl, vsSource, fsSource) {
        let vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource)
        let fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource)
        let prog = gl.createProgram()
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(prog))
        }
        return prog
    }

    createShader(gl, type, source) {
        let shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader))
        }
        return shader
    }

    render(gl, objects, camera) {
        for (let i in this.uniforms) {
            if (this.uniforms[i].type === "float") {
                gl.uniform1f(this.uniformLocations[i], this.uniforms[i].value)
            } else if (this.uniforms[i].type === "mat4") {
                gl.uniformMatrix4fv(
                    this.uniformLocations[i],
                    this.uniforms[i].value
                )
            }
        }

        // camera matrices
        gl.uniformMatrix4fv(
            this.uniformLocations["modelViewMatrix"],
            false,
            camera.modelViewMatrix
        )
        gl.uniformMatrix4fv(
            this.uniformLocations["projectionMatrix"],
            false,
            camera.projectionMatrix
        )

        for (let o in objects) {
            if (objects[o].show) {
                // object matrix
                gl.uniformMatrix4fv(
                    this.uniformLocations["modelMatrix"],
                    false,
                    objects[o].modelMatrix
                )

                // normal matrix
                gl.uniformMatrix4fv(
                    this.uniformLocations["normalMatrix"],
                    false,
                    objects[o].normalMatrix
                )

                // ambient coefficient
                gl.uniform3fv(
                    this.uniformLocations["aColor"],
                    objects[o].aColor
                )

                // diffuse coefficient
                gl.uniform3fv(
                    this.uniformLocations["dColor"],
                    objects[o].dColor
                )

                // specular coefficient
                gl.uniform3fv(
                    this.uniformLocations["sColor"],
                    objects[o].sColor
                )

                // shininess coefficient
                gl.uniform1f(
                    this.uniformLocations["shininess"],
                    objects[o].shininess
                )

                // bump scale value
                gl.uniform1f(
                    this.uniformLocations["bumpScale"],
                    objects[o].bumpScale
                )

                // texture mode
                gl.uniform1f(
                    this.uniformLocations["textureMode"],
                    objects[o].textureMode
                )

                if (objects[o].texture) {
                    gl.activeTexture(gl.TEXTURE0)
                    gl.bindTexture(gl.TEXTURE_2D, objects[o].texture)
                    gl.uniform1i(this.uniformLocations["uTexture"], 0)
                    gl.texParameteri(
                        gl.TEXTURE_2D,
                        gl.TEXTURE_MIN_FILTER,
                        gl.LINEAR
                    )
                }

                if (objects[o].bumpTexture) {
                    gl.activeTexture(gl.TEXTURE1)
                    gl.bindTexture(gl.TEXTURE_2D, objects[o].bumpTexture)
                    gl.uniform1i(this.uniformLocations["uBumpTexture"], 0)
                    gl.texParameteri(
                        gl.TEXTURE_2D,
                        gl.TEXTURE_MIN_FILTER,
                        gl.LINEAR
                    )
                }

                // positions
                gl.bindBuffer(gl.ARRAY_BUFFER, objects[o].positionBuffer)
                gl.enableVertexAttribArray(this.posLoc)
                gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0)

                // colors
                if (this.colorLoc >= 0 && objects[o].colorBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[o].colorBuffer)
                    gl.enableVertexAttribArray(this.colorLoc)
                    gl.vertexAttribPointer(
                        this.colorLoc,
                        3,
                        gl.FLOAT,
                        false,
                        0,
                        0
                    )
                }

                // normals
                if (this.normLoc >= 0 && objects[o].normalBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[o].normalBuffer)
                    gl.enableVertexAttribArray(this.normLoc)
                    gl.vertexAttribPointer(
                        this.normLoc,
                        3,
                        gl.FLOAT,
                        false,
                        0,
                        0
                    )
                }

                // tangents
                if (this.tanLoc >= 0 && objects[o].tangentBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[o].tangentBuffer)
                    gl.enableVertexAttribArray(this.tanLoc)
                    gl.vertexAttribPointer(
                        this.tanLoc,
                        3,
                        gl.FLOAT,
                        false,
                        0,
                        0
                    )
                }

                // uvs
                if (this.uvLoc >= 0 && objects[o].uvBuffer) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[o].uvBuffer)
                    gl.enableVertexAttribArray(this.uvLoc)
                    gl.vertexAttribPointer(this.uvLoc, 2, gl.FLOAT, false, 0, 0)
                }

                if (objects[o].indices) {
                    // draw by index order
                    gl.bindBuffer(
                        gl.ELEMENT_ARRAY_BUFFER,
                        objects[o].indexBuffer
                    )
                    gl.drawElements(
                        this.mode,
                        objects[o].indices.length,
                        gl.UNSIGNED_SHORT,
                        0
                    )
                } else {
                    gl.drawArrays(this.mode, 0, objects[o].positions.length / 3)
                }
            }
        }
    }
}
