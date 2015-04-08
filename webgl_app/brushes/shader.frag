#define M_PI 3.1415926535897932384626433832795
varying vec2 v_texcoord;
uniform float brushSize;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float d = distance(v_texcoord, center) * 2.0;
  float x = v_texcoord.x - 0.5;
  float y = v_texcoord.y - 0.5;
  float e = exp(-(x*x + y*y)/0.08);
  
  gl_FragColor = vec4(1.0,  // R
                      1.0,  // G
                      1.0,  // B
                      1.0 - smoothstep(1.0 - 4.0 / brushSize, 1.0, d)); // A
}
