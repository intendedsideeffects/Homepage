// D3 + SVG — drifting particles with a single highlighted dot.
const SETTINGS = {
  count: 2100,
  blueShare: 0.075,
  speed: 0.09,
  roam: 85,
  hoverRadius: 14,
  hoverSize: 20.5,
};

// 1. SETUP
const hero = document.querySelector(".hero");
const svg = d3.select("#particle-field");
const toggle = document.querySelector("#theme-toggle");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const normal = d3.randomNormal(0, 1);
let width,
  height,
  pointer = null;

function resize() {
  const oldWidth = width,
    oldHeight = height;
  width = hero.clientWidth;
  height = hero.clientHeight;
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  if (!particles) return;
  particles.forEach((d) => {
    const sx = width / oldWidth,
      sy = height / oldHeight;
    d.x *= sx;
    d.homeX *= sx;
    d.y *= sy;
    d.homeY *= sy;
  });
}

let particles;
resize();
particles = d3.range(SETTINGS.count).map(() => {
  const t = Math.random();
  const x = width * (0.49 + t * 0.53) + normal() * width * (0.045 + 0.045 * t);
  const y =
    height * (0.06 + 0.7 * t + 0.13 * Math.sin(t * Math.PI * 2.4)) +
    normal() * height * (0.09 + 0.085 * t);
  const blue = Math.random() < SETTINGS.blueShare;
  const radius =
    Math.random() < 0.89
      ? 0.45 + Math.random() * 0.6
      : 1.1 + Math.random() * 0.85;
  return {
    x,
    y,
    homeX: x,
    homeY: y,
    angle: Math.random() * Math.PI * 2,
    speed: SETTINGS.speed * (0.4 + Math.random() * 1.2),
    radius,
    displayRadius: radius,
    opacity: 0.22 + Math.random() * 0.68,
    color: blue
      ? Math.random() < 0.38
        ? "var(--particle-pale)"
        : "var(--particle-blue)"
      : Math.random() < 0.42
        ? "var(--particle-soft)"
        : "var(--particle-gray)",
  };
});

const circles = svg
  .selectAll("circle")
  .data(particles)
  .join("circle")
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("r", (d) => d.radius)
  .attr("fill", (d) => d.color)
  .attr("opacity", (d) => d.opacity);

// 2. ANIMATION
let lastTime = 0;
function animate(time) {
  const dt = Math.min((time - lastTime || 16.67) / 16.67, 2);
  lastTime = time;
  for (const d of particles) {
    d.x += Math.cos(d.angle) * d.speed * dt;
    d.y += Math.sin(d.angle) * d.speed * dt;
    // Keep each grain near its original position to preserve the cloud shape.
    if (Math.abs(d.x - d.homeX) > SETTINGS.roam) {
      d.x = d.homeX + Math.sign(d.x - d.homeX) * SETTINGS.roam;
      d.angle = Math.PI - d.angle;
    }
    if (Math.abs(d.y - d.homeY) > SETTINGS.roam) {
      d.y = d.homeY + Math.sign(d.y - d.homeY) * SETTINGS.roam;
      d.angle = -d.angle;
    }
  }

  let closest = null,
    minDistance = SETTINGS.hoverRadius;
  if (pointer)
    for (const d of particles) {
      const distance = Math.hypot(d.x - pointer.x, d.y - pointer.y);
      if (distance < minDistance) {
        minDistance = distance;
        closest = d;
      }
    }

  for (const d of particles) {
    const target = d === closest ? SETTINGS.hoverSize : d.radius;
    d.displayRadius += (target - d.displayRadius) * 0.25;
  }
  circles
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.displayRadius)
    .attr("fill", (d) => (d === closest ? "#ff80ff" : d.color)) // #CFFF04
    .attr("opacity", (d) => (d === closest ? 1 : d.opacity));
  requestAnimationFrame(animate);
}

// 3. INTERACTION & THEME
hero.addEventListener("pointermove", (event) => {
  const rect = hero.getBoundingClientRect();
  pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
});
hero.addEventListener("pointerleave", () => {
  pointer = null;
});
window.addEventListener("resize", resize);
if (!reduceMotion) requestAnimationFrame(animate);

function setTheme(dark) {
  document.body.dataset.theme = dark ? "dark" : "light";
  toggle.checked = dark;
  localStorage.setItem("ise-theme", dark ? "dark" : "light");
}
toggle.addEventListener("change", () => setTheme(toggle.checked));
setTheme(localStorage.getItem("ise-theme") === "dark");

// 4. NAVIGATION
const navLinks = document.querySelectorAll('nav a[href^="#"]');
navLinks.forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.toggle("active", item === link));
  }),
);
