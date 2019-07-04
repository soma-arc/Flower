#version 300 es

precision mediump float;

uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
uniform vec3 u_geometry; // [translateX, translateY, scele]

//[x, y, r]
{% for n in range(0, numPoint) %}
uniform vec3 u_point{{ n }};
{% endfor %}

{% for n in range(0, numLineTwoPoints) %}
{% endfor %}

{% for n in range(0, numLineMirror) %}
{% endfor %}

{% for n in range(0, numCircleThreePoints) %}
uniform vec3 u_circleThreePoints{{ n }};
{% endfor %}

{% for n in range(0, numCircleMirror) %}
{% endfor %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

const float MAX_SAMPLES = 20.;
out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_geometry.z;
        position += u_geometry.xy;

        if(abs(position.x) < .01) {
            sum += vec3(1);
            continue;
        }
        if(abs(position.y) < .01) {
            sum += vec3(1);
            continue;
        }

        {% for n in range(0, numCircleThreePoints) %}
        if(distance(u_circleThreePoints{{ n }}.xy, position) < u_circleThreePoints{{ n }}.z){
            sum += vec3(1, 0, 0);
        }
        {% endfor %}

        {% for n in range(0, numPoint) %}
        if (distance(u_point{{ n }}.xy, position) < u_point{{ n }}.z){
            sum += vec3(0, 0, 1);
        }
        {% endfor %}

    }
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
