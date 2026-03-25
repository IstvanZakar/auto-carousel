# Faceify Dynamic Carousel Widget

A modular, Vue.js-based infinite dragging carousel designed for Carrd.co integration. 

## Features
* **Headless CMS Ready:** Dynamically scrapes image URLs from native Carrd gallery elements.
* **Modular Architecture:** Utilizes a Command Queue (`window.FaceifyCarouselQueue`) to allow multiple independent carousels on a single page without DOM collisions.
* **Responsive Styling:** All visual parameters are mapped to CSS variables for component-level scope.

## Installation
Add the following dependencies to the Carrd page:
1. Vue.js (v2.6.10)
2. FontAwesome (v5.6.3)
3. Bootstrap CSS (v4.3.1)

Load the engine via jsDelivr in a Carrd Custom Code Embed:

`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/IsvanZakar/auto-carousel@main/carousel.css">`

`<script src="https://cdn.jsdelivr.net/gh/IstvanZakar/auto-carousel@main/carousel-engine.js" defer></script>`
