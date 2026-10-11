# Intended Side Effects — SVG + D3 portfolio

This is a simple static website using HTML, CSS, JavaScript, and D3.js v7 from a CDN. No Canvas, npm, build tools, or React.

## Run locally on port 3000

Open this folder in VS Code, then run:

```powershell
py -m http.server 3000
```

Open http://localhost:3000 in your browser. Keep the terminal open. Press Ctrl+C to stop.

## Change the animation

Edit the `CONFIG` object at the top of `script.js`:

- `count`: number of circles
- `speed`: animation speed
- `amplitude`: travel distance
- `mouseRadius`: cursor effect size
- `mouseStrength`: cursor displacement

The animation is SVG-based: every particle is a D3-bound `<circle>`. The light and dark modes share the same particle data and motion. `prefers-reduced-motion` is respected.

The email address and Projects section are placeholders. Replace before publishing.
