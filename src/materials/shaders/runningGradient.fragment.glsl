precision highp float;

uniform float time;
uniform vec3 baseColor;
uniform float speed;
uniform float stripeFrequency;

varying vec3 vLocalPosition;
varying vec3 vWorldNormal;

void main() {
    // Бегущий градиент: диагональные полосы в локальных координатах меша смещаются со временем.
    float phase = (vLocalPosition.x + vLocalPosition.y + vLocalPosition.z) * stripeFrequency - time * speed;
    float wave = smoothstep(0.0, 1.0, 0.5 + 0.5 * sin(phase));

    vec3 darkColor = baseColor * 0.35;
    vec3 lightColor = min(baseColor * 1.4 + 0.15, vec3(1.0));
    vec3 color = mix(darkColor, lightColor, wave);

    // Стилизованное затенение по нормали: верхние грани светлее, чтобы куб оставался объёмным.
    vec3 n = normalize(vWorldNormal);
    float shade = 0.72 + 0.22 * n.y + 0.08 * n.x;

    gl_FragColor = vec4(color * shade, 1.0);
}
