#version 300 es

//[
precision highp float;
//]

// #pragma shader_minifier_plugin bypass

uniform sampler2D F;

out vec2 dest;

const float SAMPLE_RATE = 48000.0;

const float PI = acos(-1.0);
const float TAU = 2.0 * PI;
const float BPS = 128.0 / 60.0;
const float B2T = 1.0 / BPS;

vec2 cis(float t) {
  return vec2(cos(t), sin(t));
}

vec2 shotgun(float t, float spread, float snap) {
  vec2 sum = vec2(0.0);

  for (int i = 0; i ++ < 64;) {
    vec2 dice = fract(float(i) * vec2(0.618, 0.371)); // cringe

    float partial = exp2(spread * dice.x);
    partial = mix(partial, floor(partial + 0.5), snap);

    sum += sin(TAU * t * partial) * cis(TAU * dice.y);
  }

  return sum / 64.0;
}

void main() {
  dest = vec2(0.0); // you might want to ditch this

  uint sampleIndex = uint(gl_FragCoord.x) + 4096u * uint(gl_FragCoord.y);
  float wholeTime = float(sampleIndex) / SAMPLE_RATE;
  uvec4 moddedIndex = sampleIndex % uvec4(SAMPLE_RATE * B2T * vec4(1u, 4u, 16u, 64u));
  vec4 time = vec4(moddedIndex) / SAMPLE_RATE;

  if (time.w < 61.0 * B2T) { // kick
    float t = time.x;
    float env = smoothstep(0.3, 0.1, t);

    dest += 0.5 * env * tanh(1.5 * sin(
      360.0 * t
      - 45.0 * exp(-35.0 * t)
      - 20.0 * exp(-500.0 * t)
    ));
  }

  { // hihat
    float t = mod(time.x, 0.25 * B2T);
    dest += 0.4 * exp(-30.0 * t) * shotgun(t * 3000.0, 2.0, 0.1);
  }

  { // clap
    float t = mod(time.y - B2T, 2.0 * B2T);

    float env = mix(
      exp(-20.0 * t),
      exp(-200.0 * mod(t, 0.017)),
      exp(-60.0 * max(0.0, t - 0.02))
    );

    vec2 uv = cis(360.0 * t) + 34.0 * t;

    dest += 0.2 * tanh(20.0 * env * (vec2(
      texture(F, uv).x,
      texture(F, uv + 0.05).x
    )));
  }

  // fade in / fade out
  dest *= smoothstep(0.0, 1.0, wholeTime) * smoothstep(0.0, 1.0, 60.0 - wholeTime);
}
