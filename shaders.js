//TP2 - CG - Thalia Longaray
//tdclongaray@inf.ufpel.edu.br

var vertexShaderSourcePoint = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec2 a_texCoord;
in vec3 a_normal;
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;
out vec4 v_color;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
    gl_Position = u_worldViewProjection * a_position;
    gl_PointSize = 6.0;
    v_color = a_color;
    v_texCoord = a_texCoord;
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
    vec3 surfaceWorldPosition = (u_world * a_position).xyz;
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`;

var fragmentShaderSourcePoint = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_shininess;
in vec4 v_color;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;
out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    float light = dot(normal, surfaceToLightDirection);
    float specular = 0.0;
    if(light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
    }
    outColor = texture(u_texture, v_texCoord);
    outColor.rgb *= light;
    outColor.rgb += specular;
}
`;

var vertexShaderSourceDir = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec2 a_texCoord;
in vec3 a_normal;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
out vec4 v_color;
out vec2 v_texCoord;
out vec3 v_normal;

void main() {
    gl_Position = u_worldViewProjection * a_position;
    gl_PointSize = 6.0;
    v_color = a_color;
    v_texCoord = a_texCoord;
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
}
`;

var fragmentShaderSourceDir = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec3 u_reverseLightDirection1;
uniform vec3 u_reverseLightDirection2;
uniform vec3 u_reverseLightDirection3;
in vec4 v_color;
in vec2 v_texCoord;
in vec3 v_normal;
out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    float light1 = dot(normal, u_reverseLightDirection1);
    float light2 = dot(normal, u_reverseLightDirection2);
    float light3 = dot(normal, u_reverseLightDirection3);
    outColor = texture(u_texture, v_texCoord);
    outColor.rgb *= ((light1 + light2 + light3) / 3.0);
}
`;

function create(gl, vertexShaderSource, fragmentShaderSource) {
    var program = gl.createProgram();
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) throw `erro vertex shader`;

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) throw `erro fragment shader`;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    return program;
}

function setRandomColor(gl, program) {
    var colorLocation = gl.getAttribLocation(program, "a_color");
    var colorBuffer = gl.createBuffer();
    var colors = [Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1,
                Math.random(), Math.random(), Math.random(), 1,];

    for(i = 0; i < 6; i++) {
        colors = colors.concat(colors.concat(colors.concat(colors.concat(colors.concat(colors)))));
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
}