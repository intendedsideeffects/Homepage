/* Intended Side Effects — D3 + SVG only. No Canvas.
   The particle cloud follows a slow mathematical flow field. */
const CONFIG = {
  count: 1350,        // Number of SVG circles; reduce if animation is slow
  speed: 0.38,        // Overall movement speed
  amplitude: 24,     // How far each particle drifts from its home position
  mouseRadius: 155,  // Cursor interaction radius
  mouseStrength: 13  // Cursor influence in pixels
};

const svg = d3.select('#particles');
const themeToggle = document.querySelector('#themeToggle');
const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let width = 0, height = 0, particles = [], circles, pointer = null;
let raf = null, startTime = performance.now();
const random = d3.randomLcg(0.381);

// Curved diagonal composition: loose cloud in the upper right,
// denser bands through the middle, with deliberate empty space for type.
function createData() {
  const output = [];
  for (let i = 0; i < CONFIG.count; i++) {
    const t = random();
    const centerX = width * (0.49 + 0.45 * t);
    const centerY = height * (0.02 + 0.85 * t - 0.17 * Math.sin(t * 7.2));
    const spreadX = width * (0.025 + 0.08 * Math.sin(Math.PI * t));
    const spreadY = height * (0.025 + 0.08 * Math.sin(Math.PI * t));
    const x = centerX + d3.randomNormal.source(random)(0, spreadX)();
    const y = centerY + d3.randomNormal.source(random)(0, spreadY)();
    output.push({ x, y, phase: random()*Math.PI*2,
      rate: 0.45 + random()*0.75,
      radius: random()<0.9 ? 0.45 + random()*0.85 : 1.2 + random()*1.1,
      opacity: 0.25 + random()*0.68,
      accent: random()<0.19 });
  }
  return output;
}

function resize() {
  const bounds = svg.node().getBoundingClientRect();
  width = bounds.width; height = bounds.height;
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  particles = createData();
  circles = svg.selectAll('circle').data(particles).join('circle')
    .attr('r', d => d.radius)
    .attr('opacity', d => d.opacity)
    .attr('class', d => d.accent ? 'accent-dot' : 'base-dot')
    .attr('cx', d => d.x).attr('cy', d => d.y);
  updateColors();
}

function updateColors() {
  const dark = document.body.dataset.theme === 'dark';
  circles.attr('fill', d => dark ? (d.accent ? '#bfc3d0' : '#d8d9dc') : (d.accent ? '#1645d8' : '#182438'));
}

function animate(now) {
  if (mediaReduced.matches) return;
  const t = (now - startTime) / 1000 * CONFIG.speed;
  circles
    .attr('cx', d => {
      const dx = Math.sin(t*d.rate + d.phase + d.y*0.007)*CONFIG.amplitude
               + Math.sin(t*0.41 + d.x*0.009)*CONFIG.amplitude*0.3;
      return d.x + dx + mouseOffset(d, t).x;
    })
    .attr('cy', d => {
      const dy = Math.cos(t*d.rate*0.7 + d.phase + d.x*0.006)*CONFIG.amplitude*0.65;
      return d.y + dy + mouseOffset(d, t).y;
    });
  raf = requestAnimationFrame(animate);
}
function mouseOffset(d,t) {
  if (!pointer) return {x:0,y:0};
  const px=d.x+Math.sin(t*d.rate+d.phase+d.y*.007)*CONFIG.amplitude;
  const py=d.y+Math.cos(t*d.rate*.7+d.phase+d.x*.006)*CONFIG.amplitude*.65;
  const dx=px-pointer[0],dy=py-pointer[1];
  const dist=Math.hypot(dx,dy);
  if (dist>=CONFIG.mouseRadius || dist<0.01) return {x:0,y:0};
  const force=Math.pow(1-dist/CONFIG.mouseRadius,2)*CONFIG.mouseStrength;
  return {x:dx/dist*force,y:dy/dist*force};
}
svg.node().parentElement.addEventListener('pointermove', e => {
  const r=svg.node().getBoundingClientRect();
  pointer=[e.clientX-r.left,e.clientY-r.top];
});
svg.node().parentElement.addEventListener('pointerleave',()=>{pointer=null});

themeToggle.addEventListener('click',()=>{
  const dark=document.body.dataset.theme!=='dark';
  document.body.dataset.theme=dark?'dark':'light';
  themeToggle.setAttribute('aria-pressed',String(dark));
  themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  updateColors();
});
let resizeTimeout;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimeout);
  resizeTimeout=setTimeout(resize,150);
});
mediaReduced.addEventListener('change',()=>{
  if(raf) cancelAnimationFrame(raf);
  if(!mediaReduced.matches) raf=requestAnimationFrame(animate);
  else circles.attr('cx',d=>d.x).attr('cy',d=>d.y);
});
resize();
if (!mediaReduced.matches) raf=requestAnimationFrame(animate);
