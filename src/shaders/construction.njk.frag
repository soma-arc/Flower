#version 300 es

precision mediump float;

uniform sampler2D u_accTextures;
uniform vec2 u_resolution;
uniform vec3 u_geometry; // [translateX, translateY, scele]
uniform sampler2D u_imageTexture;
uniform bool u_displayAxis;

uniform vec3 u_colorPalettesA;
uniform vec3 u_colorPalettesB;
uniform vec3 u_colorPalettesC;
uniform vec3 u_colorPalettesD;
uniform bool u_useColorPalettes;

//[x, y, r]
{% for n in range(0, numPoint) %}
uniform vec3 u_point{{ n }};
{% endfor %}

{% for n in range(0, numLineTwoPoints) %}
uniform vec4 u_line{{ n }};
{% endfor %}

{% for n in range(0, numLineMirror) %}
uniform vec4 u_lineMirror{{ n }};
{% endfor %}

{% for n in range(0, numCircleThreePoints) %}
uniform vec3 u_circleThreePoints{{ n }};
{% endfor %}

{% for n in range(0, numCircleMirror) %}
uniform vec4 u_circleMirror{{ n }};
{% endfor %}

{% for n in range(0, numOrbitSeed) %}
uniform vec4 u_orbitSeed{{ n }}; //[x, y, width, height]
{% endfor %}

vec3 getColorFromPalettes(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 hsv2rgb(float h, float s, float v){
    vec3 c = vec3(h, s, v);
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

// circle [x, y, radius, radius * radius]
vec2 circleInvert(const vec2 pos, const vec4 circle){
    vec2 p = pos - circle.xy;
    float d = length(p);
    return (p * circle.w)/(d * d) + circle.xy;
}

vec3 computeColorHSV(float loopNum) {
    return hsv2rgb(0.01 + 0.05 * (loopNum -1.), 1., 1.);
}

vec3 computeColorWithPalettes(float loopNum, vec3 a, vec3 b, vec3 c, vec3 d) {
    return getColorFromPalettes(0.05 * (loopNum - 1.0),
                                a, b, c, d);
}

vec3 computeColor(float loopNum) {
    return u_useColorPalettes ?
        computeColorWithPalettes(loopNum,
                                 u_colorPalettesA, u_colorPalettesB,
                                 u_colorPalettesC, u_colorPalettesD) :
        computeColorHSV(loopNum);
}

const int MAX_ITERATIONS = 50;
bool IIS(vec2 pos, out vec3 col) {
    float invNum = 0.;
    bool inFund = true;
    
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        {% for n in range(0, numOrbitSeed) %}
        vec2 uv{{ n }} = (pos - u_orbitSeed{{ n }}.xy) / u_orbitSeed{{ n }}.zw;
        if(0. < uv{{ n }}.x && uv{{ n }}.x < 1. &&
           0. < uv{{ n }}.y && uv{{ n }}.y < 1.) {
            vec4 c{{ n }} = textureLod(u_imageTexture, vec2(uv{{ n }}.x, 1. - uv{{ n }}.y), 0.0);
            if(c{{ n }}.w == 1.) {
                col = c{{ n }}.rgb;
                return true;
            }
        }
        {% endfor %}
        
        {% for n in range(0, numCircleMirror) %}
        if(distance(pos, u_circleMirror{{ n }}.xy) < u_circleMirror{{ n }}.z){
            pos = circleInvert(pos, u_circleMirror{{ n }});
            inFund = false;
            invNum++;
            continue;
        }
        {% endfor %}
        
        {% for n in range(0, numLineMirror) %}
        pos -= u_lineMirror{{ n }}.xy;
        float dHalfPlane{{ n }} = dot(pos, u_lineMirror{{ n }}.zw);
        invNum += (dHalfPlane{{ n }} < 0.) ? 1. : 0.;
        inFund = (dHalfPlane{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dHalfPlane{{ n }}) * u_lineMirror{{ n }}.zw;
        pos += u_lineMirror{{ n }}.xy;
        {% endfor %}
        
        if (inFund) break;
    }
    
    col = computeColor(invNum);
    return (invNum == 0.) ? false : true;
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
        
        {% for n in range(0, numPoint) %}
        if (distance(u_point{{ n }}.xy, position) < u_point{{ n }}.z){
            sum += vec3(0, 0, 1);
            continue;
        }
        {% endfor %}

        if (u_displayAxis) {
            if(abs(position.x) < .1) {
                sum += vec3(1);
                continue;
            }
            if(abs(position.y) < .1) {
                sum += vec3(1);
                continue;
            }
        }
        
        vec3 col;
        if(IIS(position, col)) {
            sum += col;
            continue;
        }

        {% for n in range(0, numLineTwoPoints) %}
        float dist{{ n }} = abs(dot(position - u_line{{ n }}.xy , u_line{{ n }}.zw));
        if (dist{{ n }} < 0.1){
            sum += vec3(1, 0, 1);
            continue;
        }
        {% endfor %}

        {% for n in range(0, numCircleThreePoints) %}
        if(distance(u_circleThreePoints{{ n }}.xy, position) < u_circleThreePoints{{ n }}.z){
            sum += vec3(1, 0, 0);
            continue;
        }
        {% endfor %}
        
    }
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
