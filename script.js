// D3 + SVG — drifting particles with a single highlighted dot.
const SETTINGS = {
  count: 2100,
  blueShare: 0.075,
  speed: 0.09,
  roam: 85,
  hoverRadius: 14,
  hoverSize: 30.5,
  visitedSize: 2.4, // Pink dots remain visible after hover.
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
  // Denser pockets along the diagonal, with quieter spaces between them.
  const clusters = [0.19, 0.48, 0.78, 0.84];
  const t =
    Math.random() < 0.72
      ? Math.max(
          0,
          Math.min(
            1,
            clusters[Math.floor(Math.random() * clusters.length)] +
              normal() * 0.065,
          ),
        )
      : Math.random();
  const x = width * (0.49 + t * 0.53) + normal() * width * (0.036 + 0.035 * t);
  const y =
    height * (0.06 + 0.7 * t + 0.13 * Math.sin(t * Math.PI * 2.4)) +
    normal() * height * (0.07 + 0.065 * t);
  const blue = Math.random() < SETTINGS.blueShare;
  const radius =
    Math.random() < 0.89
      ? 0.55 + Math.random() * 0.75
      : 1.35 + Math.random() * 1.05;
  return {
    x,
    y,
    homeX: x,
    homeY: y,
    angle: Math.random() * Math.PI * 2,
    speed: SETTINGS.speed * (0.4 + Math.random() * 1.2),
    radius,
    displayRadius: radius,
    visited: false,
    opacity:
      (t > 0.68 ? 0.36 : 0.22) + Math.random() * (t > 0.68 ? 0.58 : 0.68),
    color: blue
      ? Math.random() < 0.38
        ? "var(--particle-pale)"
        : "var(--particle-blue)"
      : Math.random() < 0.42
        ? "var(--particle-soft)"
        : "var(--particle-gray)",
  };
});

// Small, irregular cluster in the lower-left corner.
// Keep the typography clear; the cluster sits beneath the tagline.
function addParticle(x, y, spread = 1) {
  const blue = Math.random() < SETTINGS.blueShare;
  const radius = (0.55 + Math.random() * 0.85) * spread;
  particles.push({
    x,
    y,
    homeX: x,
    homeY: y,
    angle: Math.random() * Math.PI * 2,
    speed: SETTINGS.speed * (0.4 + Math.random() * 1.2),
    radius,
    displayRadius: radius,
    visited: false,
    opacity: 0.32 + Math.random() * 0.55,
    color: blue
      ? "var(--particle-blue)"
      : Math.random() < 0.42
        ? "var(--particle-soft)"
        : "var(--particle-gray)",
  });
}

// Two overlapping pockets create a small cloud, not a rectangle.
for (let i = 0; i < 145; i++) {
  const pocket = Math.random() < 0.65;
  const x =
    width * (pocket ? 0.11 : 0.23) + normal() * width * (pocket ? 0.065 : 0.05);
  const y = height * (pocket ? 0.92 : 0.89) + normal() * height * 0.038;
  addParticle(x, y);
}

// A BROKEN, airy connection toward the main cloud.
// Three short groups with large gaps: no visible line or outline.
for (let i = 0; i < 105; i++) {
  const segment = Math.random();
  const t =
    segment < 0.36
      ? Math.random() * 0.22
      : segment < 0.68
        ? 0.34 + Math.random() * 0.16
        : 0.67 + Math.random() * 0.2;
  // Curved path stays below the headline and joins the lower-left edge
  // of the large cloud. Noise makes it naturally irregular.
  const x = width * (0.27 + 0.37 * t) + normal() * width * 0.013;
  const y =
    height * (0.9 - 0.46 * t + 0.035 * Math.sin(t * Math.PI * 2)) +
    normal() * height * 0.025;
  addParticle(x, y, 0.85);
}

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

  if (closest) closest.visited = true;

  for (const d of particles) {
    const target =
      d === closest
        ? SETTINGS.hoverSize
        : d.visited
          ? Math.max(d.radius, SETTINGS.visitedSize)
          : d.radius;
    d.displayRadius += (target - d.displayRadius) * 0.25;
  }
  circles
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.displayRadius)
    .attr("fill", (d) => (d.visited ? "#ff80ff" : d.color))
    .attr("opacity", (d) => (d.visited ? 0.65 : d.opacity));
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
