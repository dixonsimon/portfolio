# Dixon Simon — Portfolio

Personal site: [dixonsimon.vercel.app](https://dixonsimon.vercel.app/)

Designer and developer in Bengaluru. Founder of [Halvane](https://halvanestudio.vercel.app/), a studio making websites, custom software and Android and desktop apps for estate agencies, clinics and other small businesses.

## Stack
Plain HTML, CSS and JavaScript, no build step. Deployed on Vercel.

- **Type:** Instrument Serif, Geist, Geist Mono; the Halvane section also uses Halvane's own EB Garamond and DM Mono (all self-hosted in `assets/fonts`)
- **Motion:** WebGL particle field that morphs between shapes as you scroll, a scroll-scrubbed 3D hero split, a "fly through the o" zoom into the work, a pinned 3D coverflow of Halvane and its concept sites, 3D frame tilts with scroll-speed motion blur and skew, character-split titles that glide in, light sections that arrive as a rounded sheet, a pointer label over media, magnetic buttons, and smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis)
- Respects `prefers-reduced-motion` (no pinning or scrubbing, content laid out plainly)

## Structure
```
index.html
assets/css/style.css
assets/js/main.js        interactions and scroll-driven motion
assets/js/field.js       WebGL particle field
assets/js/lenis.min.js   smooth scroll
assets/fonts/            woff2 files
assets/img/              project and Halvane screenshots, portrait, favicon, og image
vercel.json              caching headers
```

## Run locally
```
python3 -m http.server 8080
```
