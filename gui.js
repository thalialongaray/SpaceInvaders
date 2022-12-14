//TP2 - CG - Thalia Longaray
//tdclongaray@inf.ufpel.edu.br

const gui = new dat.GUI();
gui.close();

const fieldofview = {FieldOfView: 2.5};
gui.add(fieldofview, "FieldOfView", 0, 3).name("Field Of View");

const cameraangle = {CameraAngle: 0};
gui.add(cameraangle, "CameraAngle", 0, 365).name("Camera Angle");

const smi = {SMI: true};
gui.add(smi, "SMI");

function configureFolder(name) {
    const folder = gui.addFolder(name);

    const addvertex = {add: addVertex};
    folder.add(addvertex, "add").name("Add Vertex");

    const statetranslation = {x: 0, y: 0, z: 0};
    const foldertranslation = folder.addFolder("Translation");
    foldertranslation.add(statetranslation, "x", -10000, 10000);
    foldertranslation.add(statetranslation, "y", -10000, 10000);
    foldertranslation.add(statetranslation, "z", -10000, 10000);

    const staterotation = {x: 0, y: 0, z: 0};
    const folderrotation = folder.addFolder("Rotation");
    folderrotation.add(staterotation, "x", -360, 360);
    folderrotation.add(staterotation, "y", -360, 360);
    folderrotation.add(staterotation, "z", -360, 360);

    const statescale = {x: 1, y: 1, z: 1};
    const folderscale = folder.addFolder("Scale");
    folderscale.add(statescale, "x", 0.1, 10);
    folderscale.add(statescale, "y", 0.1, 10);
    folderscale.add(statescale, "z", 0.1, 10);

    const flagcullface = {cullface: true};
    folder.add(flagcullface, "cullface").name("Cull Face");

    const flagtriangles = {Triangles: true};
    folder.add(flagtriangles, "Triangles");

    const flaglines = {Lines: false};
    folder.add(flaglines, "Lines");

    const flagpoints = {Points: false};
    folder.add(flagpoints, "Points");

    for(i in objects) {
        gui.__folders[objects[i].name].close();
    }
    folder.open();
}
