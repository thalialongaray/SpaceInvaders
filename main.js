//TP2 - CG - Thalia Longaray
//tdclongaray@inf.ufpel.edu.br

const objects = []

var canvas = document.querySelector("#c")
canvas.width = window.innerWidth - 20
canvas.height = window.innerHeight - 20

var gl = canvas.getContext("webgl2", {preserveDrawingBuffer: true})

var st = 0
    //st = 0 -> 0 shots
    //st = 1 -> max shots
    //st = 2 -> victory
    //st = 3 -> loss
var shot = 0
var maxshot = 3
var invaders = 0

function main() {
    addInvaders(30)
    addShips()
    enableControlKeys()
}

function viewObj(obj){
    var program = create(gl, vertexShaderSourceDir, fragmentShaderSourceDir)

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.positions), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)

    var normalLocation = gl.getAttribLocation(program, "a_normal")
    var normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normalsCoord), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(normalLocation)
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0)

    var texLocation = gl.getUniformLocation(program, "u_texture")
    var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord")
    var texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texCoord), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(texCoordAttributeLocation)
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    var images = []
    var textures = []
    for(var i = 0; i < 9; i++) {
        var texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

        var image = new Image()
        image.src = "img/" + i + ".jpg"

        images.push(image)
        textures.push(texture)
    }
    
    var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection")
    var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose")
    var reverseLightDirection1 = gl. getUniformLocation(program, "u_reverseLightDirection1")
    var reverseLightDirection2 = gl. getUniformLocation(program, "u_reverseLightDirection2")
    var reverseLightDirection3 = gl. getUniformLocation(program, "u_reverseLightDirection3")

    requestAnimationFrame(drawScene)
    
    function drawScene() {
        gl.canvas.width = window.innerWidth - 20
        gl.canvas.height = window.innerHeight - 20
        var radius = 360

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        
        gl.enable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)
        
        gl.useProgram(program)

        for(var o = 0; o < objects.length; o++) {
            obj = objects[o]
            var folder = gui.__folders[obj.name]

            gl.bindTexture(gl.TEXTURE_2D, textures[obj.itex])
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[obj.itex])
            gl.generateMipmap(gl.TEXTURE_2D)
            gl.uniform1i(texLocation, 0)

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.positions), gl.STATIC_DRAW)

            obj.scale = [folder.__folders["Scale"].__controllers[0].getValue(), folder.__folders["Scale"].__controllers[1].getValue(), folder.__folders["Scale"].__controllers[2].getValue()]
            obj.rotation = [m4.degToRad(folder.__folders["Rotation"].__controllers[0].getValue()), m4.degToRad(folder.__folders["Rotation"].__controllers[1].getValue()), m4.degToRad(folder.__folders["Rotation"].__controllers[2].getValue())]
            obj.translation = [folder.__folders["Translation"].__controllers[0].getValue(), folder.__folders["Translation"].__controllers[1].getValue(), folder.__folders["Translation"].__controllers[2].getValue()]

            invaderOutLimit(obj)                            //invaders out of limit -> loss

            if(shot > 0 && st < 2) {
                if(obj.type == 2) checkShot(obj)
                if(obj.type == 1 && invaders == 0) st = 2   //0 invaders -> victory
            } else if(st == 2 && obj.type == 1) {
                end(folder)
                cameraangle.CameraAngle += 5
                if(cameraangle.CameraAngle > 360) {
                    alert("YOU WON!")
                    return
                }
            } else if(st == 3 && obj.type == 0) {
                end(folder)
                if(obj.translation[2] > 360) {
                    alert("GAME OVER!")
                    return
                }
            }

            var projectionmatrix = m4.perspective(fieldofview.FieldOfView, (gl.canvas.clientWidth / gl.canvas.clientHeight), 1, 2000)
            
            var cameramatrix = m4.yRotation(m4.degToRad(cameraangle.CameraAngle))
            cameramatrix = m4.translate(cameramatrix, 0, 0, radius * 2)

            var cameraposition = [cameramatrix[12], cameramatrix[13], cameramatrix[14]]
            var up = [0, 1, 0]
            cameramatrix = m4.lookAt(cameraposition, [0, 0, 0], up)

            var viewmatrix = m4.inverse(cameramatrix)
            var viewprojectionmatrix = m4.multiply(projectionmatrix, viewmatrix)
                
            var worldMatrix = m4.xRotation(obj.rotation[0])
            worldMatrix = m4.yRotate(worldMatrix, obj.rotation[1])
            worldMatrix = m4.zRotate(worldMatrix, obj.rotation[2])
            var worldViewProjectionMatrix = m4.multiply(viewprojectionmatrix, worldMatrix)
            var worldInverseMatrix = m4.inverse(worldMatrix)
            var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix)

            worldViewProjectionMatrix = m4.translate(worldViewProjectionMatrix, obj.translation[0], obj.translation[1], obj.translation[2])
            worldViewProjectionMatrix = m4.scale(worldViewProjectionMatrix, obj.scale[0], obj.scale[1], obj.scale[2])

            gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix)
            gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix)
            gl.uniform3fv(reverseLightDirection1, m4.normalize([0, 0, 1]))
            gl.uniform3fv(reverseLightDirection2, m4.normalize([0, -0.5, 0.5]))
            gl.uniform3fv(reverseLightDirection3, m4.normalize([1, 0, 1]))

            if(folder.__controllers[2].getValue()) gl.drawArrays(gl.TRIANGLES, 0, obj.positions.length)
            if(folder.__controllers[3].getValue()) gl.drawArrays(gl.LINE_LOOP, 0, obj.positions.length)
            if(folder.__controllers[4].getValue()) gl.drawArrays(gl.POINTS, 0, obj.positions.length)

            if(obj.type == 0 && st < 2)             moveInvader(obj, folder)
            else if(obj.type == 2 || obj.type == 4) moveShot(obj, folder)
            else if(obj.type == 3)                  moveEnemyShip(obj, folder)
        }

        requestAnimationFrame(drawScene)
    }

    function moveInvader(obj, folder) {
        if(obj.translation[0] == (Math.floor((obj.name - 1) % 10) * 250)) {
            obj.flag = false
            obj.translation[1] -= 150
        } else if(obj.translation[0] == ((Math.floor((obj.name - 1) % 10) * 250) - 2500)) {
            obj.flag = true
            obj.translation[1] -= 150
        }

        if(obj.flag)    obj.translation[0] += 25
        else            obj.translation[0] -= 25

        folder.__folders["Translation"].__controllers[0].setValue(obj.translation[0])
        folder.__folders["Translation"].__controllers[1].setValue(obj.translation[1])
    }

    function moveShot(obj, folder) {
        if(obj.type == 2)   folder.__folders["Translation"].__controllers[1].setValue(folder.__folders["Translation"].__controllers[1].getValue() + (5 * objects.length))
        else {
            folder.__folders["Translation"].__controllers[1].setValue(folder.__folders["Translation"].__controllers[1].getValue() - (3 * objects.length))
            if(obj.translation[0] <= (gui.__folders["Ship"].__folders["Translation"].__controllers[0].getValue() + 100) && obj.translation[0] >= (gui.__folders["Ship"].__folders["Translation"].__controllers[0].getValue() - 100) && obj.translation[1] <= (gui.__folders["Ship"].__folders["Translation"].__controllers[1].getValue() + 50) && obj.translation[1] >= (gui.__folders["Ship"].__folders["Translation"].__controllers[1].getValue() - 50)) {
                gui.__folders["Ship"].__folders["Translation"].__controllers[1].setValue(10000)
                gui.__folders["Enemy Ship"].__folders["Translation"].__controllers[1].setValue(10000)
                gui.__folders["Enemy Shot"].__folders["Translation"].__controllers[1].setValue(10000)
                st = 3
            }
        }
    }

    function moveEnemyShip(obj, folder) {
        if(obj.translation[0] == 2500) {
            obj.flag = false
        } else if(obj.translation[0] == (-2500)) {
            obj.flag = true
        }

        if(obj.flag)    obj.translation[0] += 20 
        else            obj.translation[0] -= 20

        folder.__folders["Translation"].__controllers[0].setValue(obj.translation[0])

        if(obj.translation[0] % 1100 == 0 && obj.translation[0] != 0 && Math.abs(obj.translation[0]) < 2000) {
            if(typeof(gui.__folders["Enemy Shot"]) == "undefined")  addShot(4)
            else {
                gui.__folders["Enemy Shot"].__folders["Translation"].__controllers[0].setValue(folder.__folders["Translation"].__controllers[0].getValue())
                gui.__folders["Enemy Shot"].__folders["Translation"].__controllers[1].setValue(folder.__folders["Translation"].__controllers[1].getValue())        
            }
        }
    }

    function end(folder) {
        if(folder.__folders["Translation"].__controllers[0].getValue() > -74) {
            folder.__folders["Translation"].__controllers[0].setValue(folder.__folders["Translation"].__controllers[0].getValue() - 25)            
        } else if(folder.__folders["Translation"].__controllers[0].getValue() < -76) {
            folder.__folders["Translation"].__controllers[0].setValue(folder.__folders["Translation"].__controllers[0].getValue() + 25)            
        }
        folder.__folders["Translation"].__controllers[1].setValue(folder.__folders["Translation"].__controllers[1].getValue() + 20)
        folder.__folders["Translation"].__controllers[2].setValue(folder.__folders["Translation"].__controllers[2].getValue() + 7)
    }
}

main()