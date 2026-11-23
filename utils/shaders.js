const vertexShader = `#version 300 es
in vec3 position;
in vec3 tangent;
in vec3 normal;
in vec2 uv;

uniform float uTime; //time in sec

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelMatrix;

out vec3 vLP1;
out vec3 vLP2;
out vec3 vLP3;
out vec2 vUV;
out vec3 vNormal;
out vec3 vTangent;
out vec3 vPosition;

void main() {
  vUV = uv;
  vLP1 = (modelViewMatrix * vec4(3., 4., 40., 1.)).xyz;
  vLP2 = (modelViewMatrix * vec4(-100., 0., -50., 1.)).xyz;
  vLP3 = (modelViewMatrix * vec4(100., 0., -50., 1.)).xyz;
  vec4 pos = modelViewMatrix * modelMatrix * vec4(position, 1.0);
  vPosition = pos.xyz;
  vNormal = mat3(normalMatrix) * normal;
  vTangent = mat3(normalMatrix) * tangent;
  gl_Position = projectionMatrix * pos;
}`

const fragmentShader = `#version 300 es
precision mediump float;
in vec3 vLP1;
in vec3 vLP2;
in vec3 vLP3;
in vec2 vUV;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vPosition;

uniform vec3 aColor;

uniform vec3 dColor;
uniform vec3 sColor;

uniform float isLight;
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
  if(isLight > 0.) {
    fragColor = vec4(dColor, 1.);
  } else {
    // Tangent frame (T, B, N)
    vec3 N = normalize(vNormal);
    vec3 T = -normalize(vTangent - dot(vTangent, N) * N);
    vec3 B = cross(N, T);
    mat3 TBN = mat3(T, B, N);

    // texture mode
    vec3 diffuseColor;
    vec3 n;
    if(textureMode == -1.) {
      diffuseColor = dColor;
    } else {
      if(textureMode == 0.) {
        // Bump mapping: tilt the normal against the gradient of the height field
        diffuseColor = dColor;
        vec2 du = vec2(1.0 / float(textureSize(uBumpTexture, 0).x), 0.0);
        vec2 dv = vec2(0.0, 1.0 / float(textureSize(uBumpTexture, 0).y));
        float dhdu = (height(vUV + du) - height(vUV - du)) * 0.5;
        float dhdv = (height(vUV + dv) - height(vUV - dv)) * 0.5;
        n = normalize(vec3(bumpScale * dhdu, bumpScale * dhdv, 1.0));
        N = normalize(TBN * n);
      } else {
        // Normal mapping
        diffuseColor = texture(uTexture, vUV).rgb;
        N = normalize(TBN * (texture(uBumpTexture, vUV).rgb*2. - 1.));
      }
    }

    vec3 V = normalize(-vPosition); // camera sits at the origin

    // ambient coefficient
    vec3 Ka = aColor;

    // light 1 (white light)
    vec3 L1 = normalize(vLP1 - vPosition);
    vec3 R1 = reflect(-L1, N);
    vec3 diff1 = vec3(0.5)*max(dot(N, L1), 0.0);
    vec3 spec1 = vec3(0.5)*pow(max(dot(V, R1), 0.0), shininess);

    // light 2 (red light)
    vec3 L2 = normalize(vLP2 - vPosition);
    vec3 R2 = reflect(-L2, N);
    vec3 diff2 = vec3(.5, 0., 0.)*max(dot(N, L2), 0.0);
    vec3 spec2 = vec3(.5, 0., 0.)*pow(max(dot(V, R2), 0.0), shininess);

    // light 3 (blue light)
    vec3 L3 = normalize(vLP3 - vPosition);
    vec3 R3 = reflect(-L3, N);
    vec3 diff3 = vec3(.0, 0.5, 1.)*max(dot(N, L3), 0.0);
    vec3 spec3 = vec3(.0, 0.5, 1.)*pow(max(dot(V, R3), 0.0), shininess);

    vec3 Ia = Ka;
    vec3 Id = diff1 + diff2 + diff3;
    vec3 Is = spec1 + spec2 + spec3;

    fragColor = vec4(diffuseColor*(Ia + Id) + sColor*Is, 1.0);
  }
}`

const rayVertexShader = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`

const rayFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform int u_maxBounces;
uniform vec2 u_resolution;
uniform vec2 u_cameraOrbit;
uniform float u_ambientStrength; //Ambient fill light for better visual

out vec4 fragColor;

const float LIGHT_POWER = 3.0;
const float FLOOR_Y = -2.0;
const float CHECKER_SIZE = 3.0;
const float GLASS_IOR = 1.05;  // refractive index of the glass sphere

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
    vec3 color;
    float reflectivity;
};

struct Cube {
    vec3 center;
    float halfSize;
    vec3 color;
    float reflectivity;
};

struct HitData {
    bool hit;
    float t;
    vec3 point;
    vec3 normal;
    vec3 color;
    float reflectivity;
    bool isLight;
    bool isGlass;
};

Sphere lightSphere[3];
Sphere sphere;
Sphere glassSphere;
Cube cube;

void initScene(float time) {
    float a = time * 0.5;
    sphere = Sphere(vec3(cos(a) * 2.5, sin(a * 1.3) * 0.8, -6.0 + sin(a) * 0.5), 1.0, vec3(1.0, 0.3, 0.3), 0.1);

    float b = time * 0.3;
    cube = Cube(vec3(sin(b) * 2.0, cos(b * 1.5) + 0.5, -9.0 + cos(b * 0.7)), 0.8, vec3(0.3, 0.8, 0.3), 0.85);

    float c = time * 0.1;
    glassSphere = Sphere(vec3(cos(c)*3.0, sin(c*1.6), -4.0 + sin(c) * 0.2), 0.6, vec3(0.5, 0.1, 1.0), 0.0);

    lightSphere[0] = Sphere(vec3(4.0, 3.0, -4.0), 0.3, vec3(1.0, 1.0, 0.9), 0.0);
    lightSphere[1] = Sphere(vec3(-4.0, 3.0, -4.0), 0.3, vec3(0.0, 0.5, 1.0), 0.0);
    lightSphere[2] = Sphere(vec3(0.0, 1.0, -15.0), 0.1, vec3(1.0, 0.5, 0.0), 0.0);
}

bool intersectSphere(Ray ray, Sphere s, out float t) {
    vec3 oc = ray.origin - s.center;
    float b = dot(oc, ray.direction);
    float d = b * b - dot(oc, oc) + s.radius * s.radius;
    if (d < 0.0) return false;

    t = -b - sqrt(d);
    if (t < 0.001) t = -b + sqrt(d);  // ray starts inside
    return t > 0.001;
}

// Slab test
bool intersectCube(Ray ray, out float t, out vec3 normal) {
    vec3 t0s = (cube.center - cube.halfSize - ray.origin) / ray.direction;
    vec3 t1s = (cube.center + cube.halfSize - ray.origin) / ray.direction;
    vec3 tmin = min(t0s, t1s);
    vec3 tmax = max(t0s, t1s);
    float t0 = max(max(tmin.x, tmin.y), tmin.z);
    float t1 = min(min(tmax.x, tmax.y), tmax.z);
    if (t1 < 0.0 || t0 > t1) return false;

    t = t0 > 0.001 ? t0 : t1;
    if (t < 0.001) return false;

    vec3 local = ray.origin + ray.direction * t - cube.center;
    vec3 a = abs(local);
    if (a.x > a.y && a.x > a.z) normal = vec3(sign(local.x), 0.0, 0.0);
    else if (a.y > a.z) normal = vec3(0.0, sign(local.y), 0.0);
    else normal = vec3(0.0, 0.0, sign(local.z));
    return true;
}

// Schlick approximation
float schlick(float cosTheta, float F0) {
    return F0 + (1.0 - F0)*pow(clamp(1.0 - cosTheta, 0., 1.), 5.);
}

bool intersectFloor(Ray ray, out float t) {
    if (abs(ray.direction.y) < 0.0001) return false;
    t = (FLOOR_Y - ray.origin.y) / ray.direction.y;
    return t > 0.001;
}

HitData traceScene(Ray ray, bool includeLight) {
    HitData hit;
    hit.hit = false;
    hit.t = 1e10;
    float t;
    vec3 n;

    if (includeLight) {
        for(int i = 0; i<lightSphere.length(); i++) {
            if(intersectSphere(ray, lightSphere[i], t) && t < hit.t) {
                hit = HitData(true, t, ray.origin + ray.direction * t, vec3(0.0), lightSphere[i].color, 0.0, true, false);
            }
        }
    }

    if (intersectFloor(ray, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        vec2 cell = floor(p.xz / CHECKER_SIZE);
        vec3 color = mod(cell.x + cell.y, 2.0) < 1.0 ? vec3(1.0) : vec3(0.05);
        hit = HitData(true, t, p, vec3(0.0, 1.0, 0.0), color, 0.0, false, false);
    }

    if (intersectCube(ray, t, n) && t < hit.t) {
        hit = HitData(true, t, ray.origin + ray.direction * t, n, cube.color, cube.reflectivity, false, false);
    }

    if (intersectSphere(ray, sphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        hit = HitData(true, t, p, (p - sphere.center) / sphere.radius, sphere.color, sphere.reflectivity, false, false);
    }
    
    if(intersectSphere(ray, glassSphere, t) && t < hit.t) {
        vec3 p = ray.origin + ray.direction * t;
        hit = HitData(true, t, p, (p - glassSphere.center) / glassSphere.radius, glassSphere.color, sphere.reflectivity, false, true);
    }

    return hit;
}

vec3 trace(Ray ray) {
    vec3 color = vec3(0.0);
    vec3 attenuation = vec3(1.0);

    //use loop to simulate the recursive process as GLSL doesn't support recursions
    for (int bounce = 0; bounce < u_maxBounces; bounce++) {
        HitData hit = traceScene(ray, true);

        if (!hit.hit) {
            float t = 0.5 * (ray.direction.y + 1.0);
            color += attenuation * mix(vec3(0.09, 0.12, 0.18), vec3(0.18, 0.21, 0.27), t);  // sky
            break;
        }

        if (hit.isLight) {
            color += attenuation * hit.color * LIGHT_POWER;
            break;
        }

        if (hit.isGlass) {
            // Refraction: either reflects or refracts the ray, whichever Schlick says is stronger
            float n1;
            float n2;
            if(dot(-ray.direction, hit.normal) < 0.0) {
                // inside object
                n1 = GLASS_IOR;
                n2 = 1.0;
            } else {
                // outside object
                n1 = 1.0;
                n2 = GLASS_IOR;
            }
            float cosTheta1 = dot(-ray.direction, hit.normal);
            float sinTheta1 = sqrt(1.0 - cosTheta1*cosTheta1);
            float sinTheta2 = (n1/n2)*sinTheta1;
            float cosTheta2 = sqrt(1.0 - sinTheta2*sinTheta2);;

            bool total_internal_reflection = n1 > n2 && sinTheta1 > (n2/n1) ? true : false;

            float F0 = (n1-n2)/(n1+n2);
            float schlick_value = schlick(n1 > n2 ? cosTheta2 : cosTheta1, F0*F0);

            vec3 direction;
            if (total_internal_reflection || schlick_value > 0.5) {
                direction = reflect(ray.direction, hit.normal);
                attenuation *= schlick_value;
            } else {
                direction = refract(ray.direction, hit.normal, n1/n2);
                attenuation *= 1.0 - schlick_value;
            }

            ray = Ray(hit.point + direction * 0.001, direction);
            attenuation *= hit.color;
            continue;
        } else {
            vec3 shading = vec3(u_ambientStrength);
            for(int i=0; i<lightSphere.length(); i++) {
                vec3 toLight = lightSphere[i].center - hit.point;
                float lightDist = length(toLight);
                vec3 lightDir = toLight / lightDist;

                HitData blocker = traceScene(Ray(hit.point + hit.normal * 0.001, lightDir), false);
                float visible = blocker.hit && blocker.t < lightDist ? 0.0 : 1.0;
                float diff = max(dot(hit.normal, lightDir), 0.0);
                float falloff = 1.0 / (1.0 + 0.1 * lightDist * lightDist);
                shading += lightSphere[i].color * LIGHT_POWER * diff * falloff * visible;
            }
            shading *= hit.color;

            color += attenuation * shading * (1.0 - hit.reflectivity);

            if (hit.reflectivity == 0.0) break;
            attenuation *= hit.reflectivity;
            ray = Ray(hit.point + hit.normal * 0.001, reflect(ray.direction, hit.normal));
        }
    }

    return color;
}

void main() {
    initScene(u_time);

    // Orbit camera around the scene center
    float cp = cos(u_cameraOrbit.x), sp = sin(u_cameraOrbit.x);
    float cy = cos(u_cameraOrbit.y), sy = sin(u_cameraOrbit.y);
    mat3 rotX = mat3(1.0, 0.0, 0.0,  0.0, cp, -sp,  0.0, sp, cp);
    mat3 rotY = mat3(cy, 0.0, -sy,  0.0, 1.0, 0.0,  sy, 0.0, cy);
    mat3 camera = rotY * rotX;

    vec3 target = vec3(0.0, 0.0, -5.0);
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    Ray ray = Ray(target + camera * vec3(0.0, 0.0, 8.0), camera * normalize(vec3(uv, -1.5)));

    fragColor = vec4(pow(trace(ray), vec3(1.0 / 2.2)), 1.0);  // gamma correction
}`
