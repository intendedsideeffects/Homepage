# Intended Side Effects — Homepage Header

Updates: clustered particle distribution with quieter spaces; slightly larger tagline and more generous line spacing; tagline reads “centering human and more-than-human experiences.” Home navigation dot is active on first load.

`script.js` has four sections: Setup, Animation, Interaction & Theme, Navigation.

Hover enlarges **only the nearest particle within 14px**, turning it pink (`#ff80ff`). The maximum SVG radius is 20.5px (41px diameter). The particles drift independently but remain near their original cloud positions. No canvas, no particle repulsion, no random angle changes.
