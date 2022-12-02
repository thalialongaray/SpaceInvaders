//TP2 - CG - Thalia Longaray
//tdclongaray@inf.ufpel.edu.br

class Obj {
    constructor(content, type) {
        if(type == 1) {
            this.name = "Ship"
            this.itex = type
        } else if(type == 2) {
            this.name = "Shot " + shot
            this.itex = type
        } else if(type == 3) {
            this.name = "Enemy Ship"
            this.itex = 0
        } else if(type == 4) {
            this.name = "Enemy Shot"
            this.itex = 8
        } else {
            this.name = (objects.length + 1)
            this.itex = Math.floor(Math.random() * 5) + 3
            //this.itex = ((this.name % invaders) % 5) + 3
        }
        configureFolder(this.name)
        this.content = content
        this.vertex = []
        this.positions = []
        this.texCoord = []
        this.normalsCoord = []
        this.translation = []
        this.rotation = []
        this.scale = []
        this.type = type
        this.flag = true
        for(var i = 0; i < content.length; i++) {
            this.item = content[i].split(" ")
            switch(this.item[0]) {
                case "v":
                    for(var j = 1; j < this.item.length; j++) {
                        this.vertex.push(parseFloat(this.item[j]))
                    }
                    break
                case "vt":
                    for(var j = 1; j < this.item.length; j++) {
                        this.texCoord.push(parseFloat(this.item[j]))
                    }
                    break
                case "vn":
                    for(var j = 1; j < this.item.length; j++) {
                        this.normalsCoord.push(parseFloat(this.item[j]))
                    }
                    break
                case "f":
                    for(var j = 1; j < this.item.length; j++) {
                        for(var k = 0; k < 3; k++) {
                            this.positions.push(this.vertex[((parseFloat(this.item[j]) - 1) * 3) + k])
                        }
                    }
                    break
            }
        }

        switch(type) {
            case 1:
                gui.__folders[this.name].__folders["Translation"].__controllers[1].setValue(gl.canvas.height * (-2.5))
                break
            case 2:
                gui.__folders[this.name].__folders["Translation"].__controllers[0].setValue(gui.__folders["Ship"].__folders["Translation"].__controllers[0].getValue())
                gui.__folders[this.name].__folders["Translation"].__controllers[1].setValue(gui.__folders["Ship"].__folders["Translation"].__controllers[1].getValue())
                break
            case 3:
                gui.__folders[this.name].__folders["Translation"].__controllers[1].setValue(gl.canvas.height * 2.2)
                break
            case 4:
                gui.__folders[this.name].__folders["Translation"].__controllers[0].setValue(gui.__folders["Enemy Ship"].__folders["Translation"].__controllers[0].getValue())
                gui.__folders[this.name].__folders["Translation"].__controllers[1].setValue(gui.__folders["Enemy Ship"].__folders["Translation"].__controllers[1].getValue())
                break
        }
    }
}