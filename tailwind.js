tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        bg: 'var(--bg-primary)',
                        text: 'var(--text-primary)',
                        'text-muted': 'var(--text-secondary)',
                        border: 'var(--border-color)',
                        
                        // Accents
                        'accent-cyan': '#00f2fe',
                        'accent-purple': '#8f00ff',
                        'accent-pink': '#ff0080',

                        // Brand
                        linkedin: '#0077b5',
                        github: '#6e5494',
                        instagram: '#E1306C',

                        // Nav dynamic
                        'nav-about': 'var(--nav-about)',
                        'nav-work': 'var(--nav-work)',
                        'nav-contact': 'var(--nav-contact)',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        brand: ['Syne', 'sans-serif'],
                    }
                }
            }
        }