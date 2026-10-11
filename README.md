# Intended Side Effects — V11

Minimal D3.js + SVG portfolio. Open `index.html` with Live Server, or run `py -m http.server 3000` from this folder and visit http://localhost:3000.

`script.js` has four sections: Setup, Animation, Interaction & Theme, Navigation.

Hover enlarges **only the nearest particle within 14px**, turning it lime (`#CFFF04`). The maximum SVG radius is 20.5px (41px diameter). The particles drift independently but remain near their original cloud positions. No canvas, no particle repulsion, no random angle changes.
