/* Dixon Simon — particle field
   A GPU point cloud drawn with raw WebGL behind the dark sections. It morphs between
   four shapes as you scroll (sphere → galaxy → wave terrain → torus knot), reacts to
   the pointer, and gets more turbulent the faster you scroll.
   Sections opt in with data-shape="<0..3>" plus optional data-shape-alpha / -x / -y. */
(() => {
  const canvas = document.querySelector('[data-gl]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) { canvas.remove(); return; }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => window.innerWidth < 760;
  const cores = navigator.hardwareConcurrency || 4;
  const COUNT = small() ? 9000 : (cores >= 8 ? 30000 : 18000);

  /* ---------- shapes ---------- */
  const rand = Math.random;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const A = new Float32Array(COUNT * 3); // sphere
  const B = new Float32Array(COUNT * 3); // galaxy
  const C = new Float32Array(COUNT * 3); // wave plane
  const D = new Float32Array(COUNT * 3); // torus knot
  const E = new Float32Array(COUNT * 3); // intro cloud
  const R = new Float32Array(COUNT * 4); // per-particle randoms
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const k = i * 3;
    // sphere: fibonacci shell plus a sparse inner volume
    const y = 1 - (i / (COUNT - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = golden * i;
    const shell = rand() < 0.86 ? 1 + gauss() * 0.012 : Math.cbrt(rand()) * 0.92;
    const rad = 1.32 * shell;
    A[k] = Math.cos(th) * rr * rad; A[k + 1] = y * rad; A[k + 2] = Math.sin(th) * rr * rad;

    // galaxy: three logarithmic arms with a dense core
    const arm = i % 3;
    const gr = Math.pow(rand(), 0.62) * 2.9;
    const ga = arm * (Math.PI * 2 / 3) + gr * 1.55 + gauss() * 0.22 / (0.4 + gr * 0.3);
    B[k] = Math.cos(ga) * gr + gauss() * 0.05;
    B[k + 1] = gauss() * 0.09 * (1.4 - gr / 3);
    B[k + 2] = Math.sin(ga) * gr + gauss() * 0.05;

    // wave plane: wide grid-ish field, displaced in the shader
    C[k] = (rand() * 2 - 1) * 5.4;
    C[k + 1] = -1.25;
    C[k + 2] = rand() * -7 + 2.2;

    // torus knot (2,3)
    const t = rand() * Math.PI * 2;
    const p = 2, q = 3, Rk = 0.95, rk = 0.36;
    const cx = (Rk + rk * Math.cos(q * t)) * Math.cos(p * t);
    const cy = (Rk + rk * Math.cos(q * t)) * Math.sin(p * t);
    const cz = rk * Math.sin(q * t) * -1;
    const tube = 0.11 * Math.sqrt(rand());
    const ta = rand() * Math.PI * 2;
    D[k] = cx + Math.cos(ta) * tube; D[k + 1] = cy + Math.sin(ta) * tube; D[k + 2] = cz + Math.cos(ta * 1.7) * tube;

    // intro cloud
    const ex = gauss(), ey = gauss(), ez = gauss();
    const el = Math.hypot(ex, ey, ez) || 1; const ed = 3 + rand() * 6;
    E[k] = ex / el * ed; E[k + 1] = ey / el * ed; E[k + 2] = ez / el * ed;

    R[i * 4] = rand(); R[i * 4 + 1] = rand(); R[i * 4 + 2] = rand(); R[i * 4 + 3] = rand();
  }

  /* ---------- shaders ---------- */
  const noise = `
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

  const vert = `
    precision highp float;
    attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute vec3 aD; attribute vec3 aE; attribute vec4 aR;
    uniform mat4 uProj; uniform float uTime; uniform float uShape; uniform float uIntro; uniform float uVel;
    uniform vec2 uRot; uniform vec2 uOffset; uniform float uScale; uniform vec2 uMouse; uniform float uSize; uniform float uFocus; uniform vec2 uView;
    varying float vAlpha; varying vec3 vColor;
    ${noise}
    mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
    mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
    void main(){
      float s=uShape;
      float w0=clamp(1.-abs(s-0.),0.,1.), w1=clamp(1.-abs(s-1.),0.,1.), w2=clamp(1.-abs(s-2.),0.,1.), w3=clamp(1.-abs(s-3.),0.,1.);
      vec3 pos=aA*w0+aB*w1+aC*w2+aD*w3;
      float t=uTime;
      float n=snoise(pos*.85+vec3(0.,t*.12,t*.07));
      // breathing surface on the sphere
      pos+=normalize(aA+1e-4)*n*.16*w0;
      // galaxy slowly rotates faster near the core
      float gr=length(aB.xz); float ga=t*.08*(1.6-min(gr,1.4)*.5);
      vec3 gpos=vec3(aB.x*cos(ga)-aB.z*sin(ga),aB.y,aB.x*sin(ga)+aB.z*cos(ga));
      pos+=(gpos-aB)*w1;
      // rolling terrain
      float wave=sin(pos.x*1.1+t*.7)*.2+sin(pos.z*1.5-t*.55)*.16+n*.14;
      pos.y+=wave*w2;
      // turbulence between shapes and with scroll speed
      float between=sin(3.14159*fract(s));
      float turb=between*.55+min(abs(uVel),1.)*.35;
      vec3 q=pos*.7+aR.xyz*3.+t*.2;
      pos+=vec3(snoise(q),snoise(q+17.1),snoise(q+31.7))*turb;
      // intro: gather from a scattered cloud
      float it=smoothstep(0.,1.,clamp(uIntro*1.25-aR.w*.25,0.,1.));
      pos=mix(aE,pos,it);
      // place in the world
      pos*=uScale;
      pos=rotY(uRot.y)*rotX(uRot.x)*pos;
      pos.xy+=uOffset;
      // pointer repels nearby particles
      vec2 dm=pos.xy-uMouse; float f=exp(-dot(dm,dm)*2.2)*.42;
      pos.xy+=normalize(dm+1e-4)*f;
      pos.z+=f*.6;
      vec3 v=pos-vec3(0.,0.,6.);
      gl_Position=uProj*vec4(v,1.);
      float blur=abs(-v.z-uFocus);
      float size=uSize*(.45+aR.x*1.1)*(1.+blur*.55);
      gl_PointSize=size*uView.y/(-v.z)*.015;
      float twinkle=.75+.25*sin(t*2.+aR.y*40.);
      vAlpha=twinkle/(1.+blur*blur*.9)*(.35+.65*it);
      vec3 bone=vec3(.937,.922,.89); vec3 ember=vec3(1.,.353,.122); vec3 warm=vec3(1.,.72,.5);
      vColor=aR.z<.1?ember:(aR.z<.18?warm:bone);
      vColor=mix(vColor,ember,w1*smoothstep(.6,0.,gr)*.6);
    }`;

  const frag = `
    precision mediump float;
    uniform float uAlpha; varying float vAlpha; varying vec3 vColor;
    void main(){
      vec2 c=gl_PointCoord-.5; float d=length(c);
      float a=smoothstep(.5,0.,d); a=a*a*1.5+smoothstep(.12,0.,d)*.6;
      gl_FragColor=vec4(vColor,a*vAlpha*uAlpha);
    }`;

  const compile = (type, src) => {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); return null; }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, vert); const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const attr = (name, data, size) => {
    const loc = gl.getAttribLocation(prog, name); if (loc < 0) return;
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  attr('aA', A, 3); attr('aB', B, 3); attr('aC', C, 3); attr('aD', D, 3); attr('aE', E, 3); attr('aR', R, 4);
  const U = {};
  ['uProj', 'uTime', 'uShape', 'uIntro', 'uVel', 'uRot', 'uOffset', 'uMouse', 'uSize', 'uFocus', 'uView', 'uAlpha', 'uScale'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  /* ---------- sizing ---------- */
  let W = 0, H = 0, dpr = 1, halfH = 1, aspect = 1;
  const FOV = 40 * Math.PI / 180;
  const resize = () => {
    const w = window.innerWidth; const h = window.innerHeight;
    if (Math.abs(w - W) < 1 && Math.abs(h - H) < 140 && W) return; // ignore mobile URL-bar jitter
    W = w; H = h; dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 1.75);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = W / H;
    const f = 1 / Math.tan(FOV / 2); const near = 0.1, far = 60;
    gl.uniformMatrix4fv(U.uProj, false, new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]));
    gl.uniform2f(U.uView, canvas.width, canvas.height);
    halfH = Math.tan(FOV / 2) * 6;
    measure();
  };

  /* ---------- scroll keyframes ---------- */
  let keys = [];
  let covers = [];
  function measure() {
    const y0 = window.scrollY;
    keys = [...document.querySelectorAll('[data-shape]')].map((el) => {
      const r = el.getBoundingClientRect();
      const mobile = small();
      return {
        y: r.top + y0 + Math.min(r.height / 2, window.innerHeight * 0.6),
        shape: +el.dataset.shape,
        alpha: +(el.dataset.shapeAlpha || 1),
        x: mobile ? +(el.dataset.shapeMx || 0) : +(el.dataset.shapeX || 0),
        oy: mobile ? +(el.dataset.shapeMy || el.dataset.shapeY || 0) : +(el.dataset.shapeY || 0),
        sc: mobile ? +(el.dataset.shapeMs || el.dataset.shapeScale || 1) : +(el.dataset.shapeScale || 1),
      };
    }).sort((a, b) => a.y - b.y);
    covers = [...document.querySelectorAll('[data-theme="light"], [data-theme="halvane"]')].map((el) => {
      const r = el.getBoundingClientRect(); return { top: r.top + y0, bottom: r.bottom + y0 };
    });
  }
  const ease = (t) => t * t * (3 - 2 * t);
  const sample = (y) => {
    if (!keys.length) return { shape: 0, alpha: 1, x: 0, oy: 0, sc: 1 };
    if (y <= keys[0].y) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y <= b.y) {
        const t = ease((y - a.y) / (b.y - a.y));
        return { shape: a.shape + (b.shape - a.shape) * t, alpha: a.alpha + (b.alpha - a.alpha) * t, x: a.x + (b.x - a.x) * t, oy: a.oy + (b.oy - a.oy) * t, sc: a.sc + (b.sc - a.sc) * t };
      }
    }
    return keys[keys.length - 1];
  };

  /* ---------- input ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / W) * 2 - 1; mouse.ty = -((e.clientY / H) * 2 - 1);
  }, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('load', measure);
  if (window.ResizeObserver) new ResizeObserver(() => measure()).observe(document.body);

  /* ---------- loop ---------- */
  let intro = 0; let introOn = document.documentElement.classList.contains('is-loaded');
  window.addEventListener('ds:loaded', () => { introOn = true; });
  const state = { shape: 0, alpha: 1, x: 0, oy: 0, sc: 1 };
  let lastY = window.scrollY; let vel = 0; let time = 0; let last = performance.now(); let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const y = window.scrollY;
    // skip drawing when a light section fully covers the viewport
    const covered = covers.some((c) => c.top <= y + 1 && c.bottom >= y + H - 1);
    const dy = y - lastY; lastY = y;
    vel += ((dy / Math.max(H, 1)) * 18 - vel) * 0.08;
    if (introOn) intro = Math.min(1, intro + dt * (reduced ? 10 : 0.42));
    if (!reduced) time += dt;
    const target = sample(y + H / 2);
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
    state.shape += (target.shape - state.shape) * k;
    state.alpha += (target.alpha - state.alpha) * k;
    state.x += (target.x - state.x) * k;
    state.oy += (target.oy - state.oy) * k;
    state.sc += (target.sc - state.sc) * k;
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    canvas.style.opacity = covered ? '0' : '1';
    if (covered) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uShape, state.shape);
    gl.uniform1f(U.uIntro, ease(intro));
    gl.uniform1f(U.uVel, reduced ? 0 : vel);
    const tiltX = state.shape > 1.5 && state.shape < 2.5 ? 0.18 : 0;
    gl.uniform2f(U.uRot, 0.22 + tiltX + mouse.y * 0.16, time * 0.06 + y * 0.00035 + mouse.x * 0.32);
    gl.uniform2f(U.uOffset, state.x * Math.min(aspect, 1.9) / 1.9 * 1.0, state.oy);
    gl.uniform2f(U.uMouse, mouse.x * halfH * aspect, mouse.y * halfH);
    gl.uniform1f(U.uSize, small() ? 1.15 : 1);
    gl.uniform1f(U.uFocus, 6);
    gl.uniform1f(U.uAlpha, state.alpha);
    gl.uniform1f(U.uScale, state.sc);
    gl.drawArrays(gl.POINTS, 0, COUNT);
  };

  resize();
  requestAnimationFrame((t) => { last = t; frame(t); });
  canvas.classList.add('is-on');
})();
