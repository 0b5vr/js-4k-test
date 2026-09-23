#version 300 es

//[
precision highp float;
//]

out vec2 dest;

const int TEXTURE_WIDTH = 4096;
const float SAMPLE_RATE = 48000.0;

const int STEP_SAMPLES = 5625; // = 15 / BPM * SAMPLE_RATE
const int BEAT_SAMPLES = 4 * STEP_SAMPLES;

const float PI = acos(-1.0);
const float TAU = 2.0 * PI;

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
  dest = vec2(0.0);

  int sampleIndex = int(gl_FragCoord.x) + TEXTURE_WIDTH * int(gl_FragCoord.y);
  float time = float(sampleIndex) / SAMPLE_RATE;

  if (sampleIndex % (64 * BEAT_SAMPLES) < 61 * BEAT_SAMPLES) { // kick
    float t = float(sampleIndex % BEAT_SAMPLES) / SAMPLE_RATE;

    float env = smoothstep(0.3, 0.1, t);

    dest += 0.5 * env * tanh(1.5 * sin(
      360.0 * t
      - 45.0 * exp(-35.0 * t)
      - 20.0 * exp(-500.0 * t)
    ));
  }

  { // hihat
    float t = float(sampleIndex % STEP_SAMPLES) / SAMPLE_RATE;

    float env = exp(-60.0 * t);
    float duck = smoothstep(0.0, 0.8, float(sampleIndex % BEAT_SAMPLES) / float(BEAT_SAMPLES));

    dest += 0.5 * env * duck * shotgun(t * 3000.0, 2.0, 0.1);
  }

  { // bass
    float t = float((sampleIndex + 2 * STEP_SAMPLES) % BEAT_SAMPLES) / SAMPLE_RATE;
    float l = float(2 * STEP_SAMPLES) / SAMPLE_RATE;
    float q = l - t;

    float env = smoothstep(0.0, 0.01, t) * smoothstep(0.0, 0.01, q);

    dest += 0.5 * env * tanh(10.0 * sin(TAU * 55.0 * t));
  }

  // fade in / fade out
  dest *= smoothstep(0.0, 1.0, time) * smoothstep(0.0, 1.0, 60.0 - time);
}
