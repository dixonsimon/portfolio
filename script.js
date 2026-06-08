gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

if (localStorage.getItem('color-theme') === 'light' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
    htmlElement.classList.remove('dark');
    htmlElement.classList.add('light');
} else {
    htmlElement.classList.add('dark');
    htmlElement.classList.remove('light');
}

themeToggleBtn.addEventListener('click', function () {
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
        localStorage.setItem('color-theme', 'light');
    } else {
        htmlElement.classList.remove('light');
        htmlElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});

// --- Scroll Progress Bar & Nav Blur Dock ---
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.querySelector('.scroll-progress').style.width = scrolled + "%";

    if (winScroll > 40) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// --- Animations ---
gsap.to('.glow-1', { backgroundColor: '#ff0080', duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
gsap.to('.glow-2', { backgroundColor: '#00f2fe', duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
gsap.to('.glow-3', { backgroundColor: '#facc15', duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });

// --- Mobile Menu Toggle ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('translate-x-0');
        if (isOpen) {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            document.body.style.overflow = '';
        } else {
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    });

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });
}

// --- Custom Cursor (Desktop Only) ---
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const hoverTriggers = document.querySelectorAll('.hover-trigger');
    let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        gsap.ticker.add(() => {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
        });

        hoverTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            trigger.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }
} else {
    // Hide cursor elements on touch devices
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
    document.body.style.cursor = 'auto';
}

// --- Scramble Text Effect on Load ---
const tl = gsap.timeline();

tl.to('.reveal-hero', { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power4.out" })
    .to("#scramble-1", { duration: 1, text: { value: "Dixon", delimiter: "" }, ease: "none" }, "-=0.5")
    .to("#scramble-2", { duration: 1, text: { value: "Simon", delimiter: "" }, ease: "none" }, "-=0.8")
    .to('.reveal-elem', { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }, "-=0.5");

// --- Magnetic Buttons Effect ---
const magnets = document.querySelectorAll('.magnetic-btn');
magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(magnet, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
    });
    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.3 });
    });
});

gsap.utils.toArray('.scroll-reveal').forEach(elem => {
    gsap.from(elem, { scrollTrigger: { trigger: elem, start: "top 80%" }, y: 60, opacity: 0, duration: 1.2, ease: "power3.out" });
});
gsap.utils.toArray('.project-image').forEach(image => {
    gsap.from(image, { scrollTrigger: { trigger: image, start: "top 95%", scrub: 1 }, scale: 1.1, y: 30, ease: "none" });
});

// --- Canvas Particle System ---
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 60;
    let mouse = { x: null, y: null, radius: 150 };

    // Handle Resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Track Mouse Position
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
            this.alpha = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Boundary Collision Reset
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            // Mouse Interaction (Gravity Pull)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 0.6;
                    this.y += (dy / dist) * force * 0.6;
                }
            }
        }

        draw() {
            const isDark = document.documentElement.classList.contains('dark');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${this.alpha})` : `rgba(0, 0, 0, ${this.alpha})`;
            ctx.fill();
        }
    }

    // Initialize Particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Draw Lines between nearby particles
    function drawLines() {
        const isDark = document.documentElement.classList.contains('dark');
        const lineColor = isDark ? '255, 255, 255' : '0, 0, 0';
        for (let i = 0; i < particles.length; i++) {
            // Draw lines from particles to cursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    const alpha = (1 - (dist / 150)) * 0.15;
                    ctx.strokeStyle = isDark ? `rgba(0, 242, 254, ${alpha})` : `rgba(255, 0, 128, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = (1 - (dist / 100)) * 0.08;
                    ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// --- 3D Parallax Tilt Effect on Card Hover ---
const cards = document.querySelectorAll('.project-card');
cards.forEach(card => {
    const container = card.querySelector('.project-image-container');
    const imgEl = card.querySelector('.project-image img');
    const textContent = card.querySelector('.md\\:col-span-5') || card.querySelector('.md\\:col-span-5.order-2');
    const sheen = card.querySelector('.glossy-sheen');

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within card
        const y = e.clientY - rect.top;  // y position within card

        // Calculate tilt angles (range: -12deg to 12deg for a premium subtle feel)
        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = (((y / rect.height) - 0.5) * -12);

        // Update container transform (tilt, lift, scale)
        gsap.to(container, {
            rotationY: rotateY,
            rotationX: rotateX,
            y: -8,
            transformPerspective: 1000,
            scale: 1.02,
            duration: 0.4,
            ease: "power2.out"
        });

        // Parallax image shift & hover zoom
        if (imgEl) {
            const moveX = ((x / rect.width) - 0.5) * -15;
            const moveY = ((y / rect.height) - 0.5) * -15;
            gsap.to(imgEl, {
                x: moveX,
                y: moveY,
                scale: 1.1, // Zoom in to make it look bigger
                duration: 0.4,
                ease: "power2.out"
            });
        }

        // Text content parallax nudge
        if (textContent) {
            const textMoveX = ((x / rect.width) - 0.5) * 8;
            const textMoveY = ((y / rect.height) - 0.5) * 8;
            gsap.to(textContent, {
                x: textMoveX,
                y: textMoveY,
                duration: 0.4,
                ease: "power2.out"
            });
        }

        // Update glossy sheen position
        if (sheen) {
            const sheenX = (x / rect.width) * 100;
            const sheenY = (y / rect.height) * 100;
            sheen.style.setProperty('--sheen-x', `${sheenX}%`);
            sheen.style.setProperty('--sheen-y', `${sheenY}%`);
        }
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(container, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out"
        });
        if (imgEl) {
            gsap.to(imgEl, {
                x: 0,
                y: 0,
                scale: 1, // Reset zoom
                duration: 0.6,
                ease: "power2.out"
            });
        }
        if (textContent) {
            gsap.to(textContent, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        }
    });
});

// --- Bento Card Spotlight Tracker ---
const bentoCards = document.querySelectorAll('.bento-card');
bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// --- Scroll to Top & Circular Progress Logic ---
const scrollToTopBtn = document.getElementById('scroll-to-top');
const progressCircle = document.getElementById('scroll-progress-circle');
const circleLength = 2 * Math.PI * 40; // 251.32

if (scrollToTopBtn && progressCircle) {
    progressCircle.style.strokeDasharray = circleLength;
    progressCircle.style.strokeDashoffset = circleLength;

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = Math.min(Math.max(winScroll / (height || 1), 0), 1);

        const offset = circleLength - (scrolled * circleLength);
        progressCircle.style.strokeDashoffset = offset;

        if (winScroll > 300) {
            scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            scrollToTopBtn.classList.add('opacity-100');
        } else {
            scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            scrollToTopBtn.classList.remove('opacity-100');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- Background Grid Follow-Mouse Mask ---
const gridOverlay = document.querySelector('.grid-overlay');
if (gridOverlay) {
    gridOverlay.style.maskImage = 'radial-gradient(circle 300px at 50% 50%, black 20%, transparent 80%)';
    gridOverlay.style.webkitMaskImage = 'radial-gradient(circle 300px at 50% 50%, black 20%, transparent 80%)';

    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        gridOverlay.style.maskImage = `radial-gradient(circle 300px at ${x}px ${y}px, black 20%, transparent 80%)`;
        gridOverlay.style.webkitMaskImage = `radial-gradient(circle 300px at ${x}px ${y}px, black 20%, transparent 80%)`;
    });
}