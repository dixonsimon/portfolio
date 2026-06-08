# Dixon Simon | Premium Interactive Portfolio 🌌

🤖 A premium, non-minimalist personal portfolio showcasing my academic journey in **Artificial Intelligence & Machine Learning (AIML)** and creative developer projects. Built with advanced animations, custom canvas overlays, and responsive design.

<img width="1326" height="828" alt="Dixon Simon Portfolio Showcase" src="https://res.cloudinary.com/dccrbxfro/image/upload/v1780928428/screenshot-1780848534566_bm0uo4.png" />

### 🔗 [Live Demo Link](https://dixonsimon.vercel.app/)

---

## ⚡ Core Features

### 1. 🌌 Interactive Particle Canopy Canvas
* **Cursor-Attached Constellation**: A custom HTML5 canvas backdrop renders floating particles that draw glowing web lines directly to the cursor when in range.
* **Gravitational Attraction**: Particles feel a subtle gravitational pull towards the mouse, creating a responsive particle mesh.
* **Theme-Aware Colors**: Canvas webbing adapts dynamically between cyan and pink hues depending on dark/light mode toggle.

### 2. 🎮 3D Card Parallax & Glossy Specular Highlight
* **Multi-Layer Isolation**: Animations are distributed across separate DOM nodes to prevent transform locking:
  * **Card Tilt & Lift (GSAP)**: Tilts cards on mousemove (`rotateX`/`rotateY`), scales up slightly, and lifts them up (`y: -8`) on hover.
  * **Image Parallax Zoom**: The child image (`.project-image img`) zooms (`scale: 1.1`) and offsets slightly in the opposite direction of the cursor.
  * **Scroll Parallax (ScrollTrigger)**: Handles entrance scroll translation smoothly.
* **Glass Specular Highlight**: A cursor-tracking radial reflection sheen overlay tracks the mouse in real-time, accompanied by a diagonal catching-light sweeping sheen transition when hovered.

### 3. 🧱 Minecraft Chiseled Stone Bento Cards
* **5-Layer Concentric Shadow Carving**: The *Tech Stack* and *Focus Areas* containers are modeled after Minecraft's chiseled stone block design, using concentric inset box-shadow layers.
* **Monospace GUI Slots**: Individual tech skills align perfectly in blocky inventory-slot slots (`.minecraft-slot`) inspired by game interfaces.
* **Dynamic Hover Spotlights**: Moving the mouse over the cards reveals a responsive colored radial spotlight (yellow for Tech Stack, cyan for Focus Areas).

### 4. 🎛️ HUD Widgets & Micro-Animations
* **Scramble Text Entrance**: Hero headers scramble text from random characters into `"Dixon"` and `"Simon"` on page load.
* **Pulsing Coordinate Beacons**: Ambient pulsing anchor beacons align the page next to vertical gridlines.
* **Scroll-to-Top HUD Speedometer**: A floating circular SVG widget in the bottom-right fills up dynamically based on page scroll depth, offering a smooth return scroll.

---

## 🛠️ Technology Stack & Libraries

* **Core**: Semantic HTML5, Vanilla CSS3 (Custom Properties, keyframes), Tailwind CSS (Utility classes)
* **Animation Engines**: 
  * **GSAP 3** (GreenSock Animation Platform)
  * **ScrollTrigger** (Smooth scroll tracking)
  * **TextPlugin** (Character scrambles)
* **Interactions**: HTML5 Canvas 2D Context, dynamic CSS Custom Variables, GSAP Ticker
* **Contact Integration**: Formspree API

---

## 📂 Featured Projects

### 🤠 Ashes of Outlaws
* **Description**: A premium 3rd-person Western action-adventure game. Take control of a bandit traversing stylized, atmospheric environments.
* **Tech Stack**: `Unity 6`, `C#`, `Universal Render Pipeline (URP)`

### 📅 Catch Up Now
* **Description**: The ultimate AI assistant that reads calendar events, notifications, and calls to automatically prioritize daily task lists.
* **Tech Stack**: `Kotlin`, `Android SDK`, `Gemini API`

### 🍵 SOCSE Chaiwala
* **Description**: A fun, interactive student dashboard featuring academic vibes, tea-themed animations, and a responsive GPA calculator.
* **Tech Stack**: `HTML5`, `CSS3`, `JavaScript`

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/dixonsimon/Portfolio.git
   ```
2. Open `portfolio/index.html` directly in your browser, or spin up a local development server:
   ```bash
   # Using VS Code Live Server or Python:
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` to interact with the site locally!