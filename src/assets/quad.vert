#version 300 es

out vec2 v;

void main() {
  v = -1.0 + 4.0 * vec2(gl_VertexID == 1, gl_VertexID == 2);
  gl_Position = vec4(v, 0, 1);
}
