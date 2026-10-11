// D3 + SVG: individual sand grains, no springs or liquid motion.
const SETTINGS = { count: 2100, blueShare: 0.075, speed: 0.09, roam: 85, mouseRadius: 115, mousePush: 12 };
const hero = document.querySelector('.hero');
const svg = d3.select('#particle-field');
const toggle = document.querySelector('#theme-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const normal = d3.randomNormal(0, 1);
let width, height, grains, circles, previousPointer;

function resize() {
  const oldWidth = width, oldHeight = height;
  width = hero.clientWidth;
  height = hero.clientHeight;
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  if (!grains) return;
  grains.forEach(d => {
    d.x *= width / oldWidth; d.homeX *= width / oldWidth;
    d.y *= height / oldHeight; d.homeY *= height / oldHeight;
  });
}

resize();
grains = d3.range(SETTINGS.count).map(() => {
  const t = Math.random();
  const x = width * (0.49 + t * 0.53) + normal() * width * (0.045 + 0.045 * t);
  const y = height * (0.06 + 0.7 * t + 0.13 * Math.sin(t * Math.PI * 2.4)) + normal() * height * (0.09 + 0.085 * t);
  const blue = Math.random() < SETTINGS.blueShare;
  return {
    x, y, homeX: x, homeY: y,
    angle: Math.random() * Math.PI * 2,
    speed: SETTINGS.speed * (0.4 + Math.random() * 1.2),
    radius: Math.random() < 0.89 ? 0.45 + Math.random() * 0.6 : 1.1 + Math.random() * 0.85,
    opacity: 0.22 + Math.random() * 0.68,
    color: blue ? (Math.random() < 0.38 ? 'var(--particle-pale)' : 'var(--particle-blue)')
                : (Math.random() < 0.42 ? 'var(--particle-soft)' : 'var(--particle-gray)')
  };
});

circles = svg.selectAll('circle').data(grains).join('circle')
  .attr('r', d => d.radius).attr('fill', d => d.color).attr('opacity', d => d.opacity);

// Mouse movement displaces grains directly; nothing pulls them back.
hero.addEventListener('pointermove', event => {
  if (reduceMotion) return;
  const rect = hero.getBoundingClientRect();
  const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  if (previousPointer) {
    const step = Math.min(Math.hypot(pointer.x - previousPointer.x, pointer.y - previousPointer.y), 20) / 20;
    for (const d of grains) {
      const dx = d.x - pointer.x, dy = d.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < SETTINGS.mouseRadius) {
        const push = SETTINGS.mousePush * step * (1 - distance / SETTINGS.mouseRadius) ** 2;
        d.x += dx / distance * push;
        d.y += dy / distance * push;
      }
    }
  }
  previousPointer = pointer;
});
hero.addEventListener('pointerleave', () => { previousPointer = null; });

let lastTime = 0;
function animate(time) {
  const dt = Math.min((time - lastTime || 16.67) / 16.67, 2);
  lastTime = time;
  for (const d of grains) {
    if (Math.random() < 0.006 * dt) d.angle += (Math.random() - 0.5) * 0.35;
    d.x += Math.cos(d.angle) * d.speed * dt;
    d.y += Math.sin(d.angle) * d.speed * dt;
    // Bounce within a small local area, keeping the original uneven cloud.
    if (Math.abs(d.x - d.homeX) > SETTINGS.roam) {
      d.x = d.homeX + Math.sign(d.x - d.homeX) * SETTINGS.roam;
      d.angle = Math.PI - d.angle;
    }
    if (Math.abs(d.y - d.homeY) > SETTINGS.roam) {
      d.y = d.homeY + Math.sign(d.y - d.homeY) * SETTINGS.roam;
      d.angle = -d.angle;
    }
  }
  circles.attr('cx', d => d.x).attr('cy', d => d.y);
  requestAnimationFrame(animate);
}
circles.attr('cx', d => d.x).attr('cy', d => d.y);
window.addEventListener('resize', resize);
if (!reduceMotion) requestAnimationFrame(animate);

function setTheme(dark) {
  document.body.dataset.theme = dark ? 'dark' : 'light';
  toggle.checked = dark;
  localStorage.setItem('ise-theme', dark ? 'dark' : 'light');
}
toggle.addEventListener('change', () => setTheme(toggle.checked));
setTheme(localStorage.getItem('ise-theme') === 'dark');
