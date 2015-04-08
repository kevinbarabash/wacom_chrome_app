varying vec2 v_texcoord;

void main() {
  // projectionMatrix and modelViewMatrix are defined by THREE.js
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
                
  v_texcoord = uv;
}