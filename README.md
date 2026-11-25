# Dixon Simon — Portfolio

Personal site: [dixonsimon.vercel.app](https://dixonsimon.vercel.app/)

Designer and developer in Bengaluru. Founder of [Halvane](https://halvaneservice.vercel.app/), a web design studio for small businesses.

## Stack
Plain HTML, CSS and JavaScript, no build step. Deployed on Vercel.

- **Type:** Instrument Serif, Geist, Geist Mono (self-hosted in `assets/fonts`)
- **Motion:** word-by-word blur reveals, clip-path image reveals, scroll parallax, scroll-speed motion blur on the marquee, smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis)
- Respects `prefers-reduced-motion`

## Structure
```
index.html
assets/css/style.css
assets/js/main.js        interactions
assets/js/lenis.min.js   smooth scroll
assets/fonts/            woff2 files
assets/img/              project screenshots, portrait, favicon, og image
vercel.json              caching headers
```

## Run locally
```
python3 -m http.server 8080
```
