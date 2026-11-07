const vertexShader = `#version 300 es
in vec3 position;
in vec3 normal;
in vec2 uv;

uniform float uTime; //time in sec

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelMatrix;

out vec2 vUV;
out vec3 vNormal;
out vec3 vPosition;

void main() {
  vUV = uv;
  vec4 pos = modelViewMatrix * modelMatrix * vec4(position, 1.0);
  vPosition = pos.xyz;
  vNormal = mat3(normalMatrix) * normal;
  gl_Position = projectionMatrix * pos;
}`

const fragmentShader = `#version 300 es
precision mediump float;
in vec2 vUV;
in vec3 vNormal;
in vec3 vPosition;

uniform vec3 aColor;
uniform vec3 dColor;
uniform vec3 sColor;

uniform float shininess;

uniform float bumpScale;
uniform float textureMode;

uniform sampler2D uTexture;
uniform sampler2D uBumpTexture;

out vec4 fragColor;

float height(vec2 uv) {
  vec3 c = texture(uTexture, uv).rgb;
  return 1.0 - dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  // texture mode
  vec3 diffColor;
  vec3 N = normalize(vNormal);
  if(textureMode == -1.) {
    diffColor = dColor;
  } else {
    diffColor = texture(uTexture, vUV).rgb;
    if(textureMode == 0.) {
      // Bump mapping: tilt the normal against the gradient of the height field
      vec2 du = vec2(1.0 / float(textureSize(uTexture, 0).x), 0.0);
      vec2 dv = vec2(0.0, 1.0 / float(textureSize(uTexture, 0).y));
      float dhdu = (height(vUV + du) - height(vUV - du)) * 0.5;
      float dhdv = (height(vUV + dv) - height(vUV - dv)) * 0.5;
      N = normalize(vec3(-bumpScale * dhdu, -bumpScale * dhdv, 1.0));
    } else {
      N = normalize(texture(uBumpTexture, vUV).rgb * 2.0 - 1.0);
    }
  }

  // ambient coefficient
  vec3 Ka = vec3(0.1);

  vec3 V = normalize(-vPosition); // camera sits at the origin

  // light 1 (white light)
  vec3 L1 = normalize(vec3(3., 4., -10.) - vPosition);
  vec3 R1 = reflect(-L1, N);
  vec3 diff1 = vec3(0.5)*max(dot(N, L1), 0.0);
  vec3 spec1 = vec3(0.5)*pow(max(dot(V, R1), 0.0), shininess);

  // light 2 (red light)
  vec3 L2 = normalize(vec3(-100., 0., -100.) - vPosition);
  vec3 R2 = reflect(-L2, N);
  vec3 diff2 = vec3(.5, 0., 0.)*max(dot(N, L2), 0.0);
  vec3 spec2 = vec3(.5, 0., 0.)*pow(max(dot(V, R2), 0.0), shininess);

  // light 3 (blue light)
  vec3 L3 = normalize(vec3(100., 0., -100.) - vPosition);
  vec3 R3 = reflect(-L3, N);
  vec3 diff3 = vec3(.0, 0.5, 1.)*max(dot(N, L3), 0.0);
  vec3 spec3 = vec3(.0, 0.5, 1.)*pow(max(dot(V, R3), 0.0), shininess);

  vec3 Ia = Ka;
  vec3 Id = diff1 + diff2 + diff3;
  vec3 Is = spec1 + spec2 + spec3;

  fragColor = vec4(aColor*Ia + diffColor*Id + sColor*Is, 1.0);
}`
