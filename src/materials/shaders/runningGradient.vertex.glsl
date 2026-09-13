precision highp float;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 world;
uniform mat4 worldViewProjection;

varying vec3 vLocalPosition;
varying vec3 vWorldNormal;

void main() {
    vLocalPosition = position;
    vWorldNormal = normalize(mat3(world) * normal);
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
