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

        themeToggleBtn.addEventListener('click', function() {
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

        // --- Scroll Progress Bar ---
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.querySelector('.scroll-progress').style.width = scrolled + "%";
        });

        // --- Animations ---
        gsap.to('.glow-1', { backgroundColor: '#ff0080', duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to('.glow-2', { backgroundColor: '#00f2fe', duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
        gsap.to('.glow-3', { backgroundColor: '#8f00ff', duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });

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