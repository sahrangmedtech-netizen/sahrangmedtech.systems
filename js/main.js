/**
 * Sahrang Medtech — main.js
 * Global behaviours shared across every page.
 *
 * Contents:
 *  1. Navbar — hide / show on scroll + shadow
 *  2. Hamburger — mobile menu toggle
 *  3. Theme mode — light/dark toggle + logo swap
 *  4. Smooth scrolling — anchor link offset
 *  5. Back-to-Top — visibility + click
 *  6. Scroll-reveal — IntersectionObserver for .animate-on-scroll
 *  7. Footer wiring — legal links + controls
 */

(function () {
    'use strict';

    /* ── 1. Navbar — hide / show on scroll ───────────────────── */
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', function () {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 80) {
                // Always visible near the top
                navbar.classList.remove('nav-hidden');
                navbar.classList.add('nav-visible');
            } else if (currentScrollY > lastScrollY + 4) {
                // Scrolling down — hide
                navbar.classList.add('nav-hidden');
                navbar.classList.remove('nav-visible');
            } else if (currentScrollY < lastScrollY - 4) {
                // Scrolling up — reveal
                navbar.classList.remove('nav-hidden');
                navbar.classList.add('nav-visible');
            }

            // Box-shadow when page is scrolled
            navbar.style.boxShadow = currentScrollY > 20
                ? (document.body.classList.contains('dark-mode')
                    ? '0 2px 12px rgba(0,0,0,0.45)'
                    : '0 2px 8px rgba(0,32,80,0.10)')
                : 'none';

            lastScrollY = currentScrollY;

            /* ── 5b. Back-to-Top visibility (on same scroll event) ── */
            const btt = document.getElementById('backToTop');
            if (btt) {
                btt.classList.toggle('visible', currentScrollY > 400);
            }
        }, { passive: true });
    }


    /* ── 2. Hamburger — mobile menu toggle ───────────────────── */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.nav-links-mobile');
    const hamburgerIcon = document.getElementById('hamburgerIcon');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('active');
            if (hamburgerIcon) {
                hamburgerIcon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
            }
        });
    }

    /** Helper: close the mobile menu and reset the icon. */
    function closeMobileMenu() {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (hamburgerIcon) hamburgerIcon.className = 'ri-menu-line';
    }


    /* ── 3. Theme mode — toggle + persistence + logo swap ────── */
    const THEME_KEY = 'sahrang-theme-mode';

    function updateLogos(isDark) {
        document.querySelectorAll('img[src*="logo_transperent.png"]').forEach(function (img) {
            if (!img.dataset.lightLogo) {
                img.dataset.lightLogo = img.getAttribute('src') || '';
            }

            if (!img.dataset.darkLogo) {
                img.dataset.darkLogo = img.dataset.lightLogo.replace(
                    /Blue_logo_transperent\.png/i,
                    'black_n_white_logo_transperent.png'
                );
            }

            img.setAttribute('src', isDark ? img.dataset.darkLogo : img.dataset.lightLogo);
        });
    }

    function updateThemeControls(isDark) {
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('.theme-toggle-label');

            if (icon) {
                icon.className = isDark ? 'ri-sun-line' : 'ri-moon-line';
            }
            if (text) {
                text.textContent = isDark ? 'Light mode' : 'Dark mode';
            }

            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    function applyTheme(mode, persist) {
        const isDark = mode === 'dark';
        document.body.classList.toggle('dark-mode', isDark);

        if (persist) {
            try {
                localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
            } catch (_err) {
                // Ignore storage errors (private mode / blocked storage)
            }
        }

        updateThemeControls(isDark);
        updateLogos(isDark);
    }

    function createThemeToggleButton(isMobile) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = isMobile
            ? 'nav-icon-btn theme-toggle-btn theme-toggle-mobile'
            : 'nav-icon-btn theme-toggle-btn theme-toggle-desktop';

        if (isMobile) {
            btn.innerHTML = '<i class="ri-moon-line" aria-hidden="true"></i><span class="theme-toggle-label">Dark mode</span>';
        } else {
            btn.innerHTML = '<i class="ri-moon-line" aria-hidden="true"></i><span class="theme-toggle-label sr-only">Dark mode</span>';
            btn.title = 'Toggle dark mode';
        }

        btn.addEventListener('click', function () {
            const isDark = document.body.classList.contains('dark-mode');
            applyTheme(isDark ? 'light' : 'dark', true);
        });

        return btn;
    }

    function mountThemeControls() {
        const navRight = document.querySelector('.nav-right');
        if (navRight && !navRight.querySelector('.theme-toggle-btn')) {
            const desktopBtn = createThemeToggleButton(false);
            const cta = navRight.querySelector('.nav-cta');

            if (cta && cta.nextSibling) {
                navRight.insertBefore(desktopBtn, cta.nextSibling);
            } else if (cta) {
                navRight.appendChild(desktopBtn);
            } else {
                navRight.appendChild(desktopBtn);
            }
        }

        if (mobileMenu && !mobileMenu.querySelector('.theme-toggle-mobile')) {
            const mobileItem = document.createElement('li');
            mobileItem.appendChild(createThemeToggleButton(true));

            const mobileCta = mobileMenu.querySelector('a.nav-cta')
                ? mobileMenu.querySelector('a.nav-cta').closest('li')
                : null;

            if (mobileCta) {
                mobileMenu.insertBefore(mobileItem, mobileCta);
            } else {
                mobileMenu.appendChild(mobileItem);
            }
        }
    }

    function initThemeMode() {
        let storedMode = 'light';
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'dark' || saved === 'light') {
                storedMode = saved;
            }
        } catch (_err) {
            // Ignore storage errors and keep default light mode
        }

        mountThemeControls();
        applyTheme(storedMode, false);
    }

    initThemeMode();


    /* ── 4. Smooth scrolling — anchor links with navbar offset ── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // bare "#" — just close menu

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offset = navbar ? navbar.offsetHeight : 0;
            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: 'smooth'
            });

            closeMobileMenu();
        });
    });


    /* ── 5. Back-to-Top click ─────────────────────────────────── */
    const bttBtn = document.getElementById('backToTop');
    if (bttBtn) {
        bttBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* ── 6. Scroll-reveal — IntersectionObserver ─────────────── */
    const revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Unobserve once revealed — no need to re-trigger
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        revealObserver.observe(el);
    });


    /* ── 7. Footer wiring — legal links + controls ───────────── */
    const footerLinkMap = {
        'about': '/about.html',
        'documentation': '/documentation.html',
        'warranty': '/warranty.html',
        'consumer health privacy': '/consumer-health-privacy.html',
        'privacy policy': '/privacy-policy.html',
        'terms of use': '/terms-of-use.html',
        'trademarks': '/trademarks.html'
    };

    document.querySelectorAll('.site-footer a').forEach(function (link) {
        const key = link.textContent.trim().toLowerCase();
        if (Object.prototype.hasOwnProperty.call(footerLinkMap, key)) {
            link.setAttribute('href', footerLinkMap[key]);
        }
    });

    const languagePath = '/language.html';
    const privacyChoicesPath = '/your-privacy-choices.html';

    document.querySelectorAll('.footer-lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.location.href = languagePath;
        });
    });

    document.querySelectorAll('.footer-privacy-toggle').forEach(function (toggle) {
        const msToggle = toggle.querySelector('.ms-toggle');

        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-label', 'Open privacy choices');

        function openPrivacyChoices() {
            if (msToggle) {
                msToggle.classList.toggle('is-on');
            }
            window.location.href = privacyChoicesPath;
        }

        toggle.addEventListener('click', openPrivacyChoices);
        toggle.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPrivacyChoices();
            }
        });
    });

}());
