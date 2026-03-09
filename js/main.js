/**
 * Sahrang Medtech — main.js
 * Global behaviours shared across every page.
 *
 * Contents:
 *  1. Navbar — hide / show on scroll + shadow
 *  2. Hamburger — mobile menu toggle
 *  3. Smooth scrolling — anchor link offset
 *  4. Back-to-Top — visibility + click
 *  5. Scroll-reveal — IntersectionObserver for .animate-on-scroll
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
                ? '0 2px 8px rgba(0,32,80,0.10)'
                : 'none';

            lastScrollY = currentScrollY;

            /* ── 4b. Back-to-Top visibility (on same scroll event) ── */
            const btt = document.getElementById('backToTop');
            if (btt) {
                btt.classList.toggle('visible', currentScrollY > 400);
            }
        }, { passive: true });
    }


    /* ── 2. Hamburger — mobile menu toggle ───────────────────── */
    const hamburger    = document.querySelector('.hamburger');
    const mobileMenu   = document.querySelector('.nav-links-mobile');
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


    /* ── 3. Smooth scrolling — anchor links with navbar offset ── */
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


    /* ── 4. Back-to-Top click ─────────────────────────────────── */
    const bttBtn = document.getElementById('backToTop');
    if (bttBtn) {
        bttBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* ── 5. Scroll-reveal — IntersectionObserver ─────────────── */
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

}());
