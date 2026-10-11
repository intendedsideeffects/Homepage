# Intended Side Effects — V10: Single Particle Hover

D3.js + SVG, without Canvas. The existing layout, colors, sections, and particle drift remain unchanged.

Only the **nearest particle** within 14 px of the cursor reacts: it grows to a radius of 6.5 px and turns warm signal yellow (#e3bf38). No repulsion or fluid movement. When the cursor moves away, it shrinks to its original size. The same yellow works in light and dark modes.

Adjust `hoverRadius` (hit distance) and `hoverSize` (highlighted particle radius) in `script.js`.

Start in VS Code terminal: `py -m http.server 3000`, then visit http://localhost:3000.
