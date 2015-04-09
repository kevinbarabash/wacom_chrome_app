#define M_PI 3.1415926535897932384626433832795

varying vec2 v_texcoord;

uniform float brushSize;
uniform vec3 color;
uniform float softness;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float d = distance(v_texcoord, center) * 2.0;
  float x = v_texcoord.x - 0.5;
  float y = v_texcoord.y - 0.5;
  float e = exp(-(x*x + y*y)/0.08);
  
  float max = 1.0 - 4.0 / brushSize;
  float flow = 0.5;
  gl_FragColor = vec4(color, flow * smoothstep(1.0, clamp(softness, 0.0, 1.0) * max, d));
}
