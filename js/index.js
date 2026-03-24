/**
 * Sahrang Medtech — index.js
 * Scripts specific to the home page (index.html).
 *
 * Contents:
 *  1. Console error suppression (Google / YouTube embed noise)
 *  2. Contact form — async Formspree submission
 */

(function () {
    'use strict';

    /* ── 1. Suppress known benign third-party console errors ─── */
    const _origConsoleError = console.error;

    console.error = function (...args) {
        const msg = args.join(' ');
        const IGNORED = [
            'play.google.com/log',
            'youtube.googleapis.com/youtubei',
            'video.google.com/api/stats',
            'ERR_BLOCKED_BY_CLIENT',
        ];
        if (IGNORED.some(function (pattern) { return msg.includes(pattern); })) return;
        _origConsoleError.apply(console, args);
    };


    /* ── 2. Contact form — Formspree async submission ────────── */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn   = this.querySelector('.form-submit');
            const originalHTML = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML  = '<i class="ri-loader-4-line ri-spin"></i> Sending…';
            submitBtn.disabled   = true;

            try {
                const response = await fetch(this.action, {
                    method:  this.method,
                    body:    new FormData(this),
                    headers: { 'Accept': 'application/json' },
                });

                if (response.ok) {
                    // Success
                    submitBtn.innerHTML           = '<i class="ri-check-line"></i> Message Sent!';
                    submitBtn.style.background    = '#002050';
                    this.reset();

                    setTimeout(function () {
                        submitBtn.innerHTML        = originalHTML;
                        submitBtn.disabled         = false;
                        submitBtn.style.background = '';
                    }, 3000);

                } else {
                    // Server-side validation error from Formspree
                    const data     = await response.json().catch(function () { return {}; });
                    const errorMsg = (data && data.errors)
                        ? data.errors.map(function (err) { return err.message; }).join(', ')
                        : 'Submission failed. Please try again.';

                    submitBtn.innerHTML           = '<i class="ri-error-warning-line"></i> Error — Retry';
                    submitBtn.style.background    = '#A4262C';
                    alert(errorMsg);

                    setTimeout(function () {
                        submitBtn.innerHTML        = originalHTML;
                        submitBtn.disabled         = false;
                        submitBtn.style.background = '';
                    }, 2000);
                }

            } catch (err) {
                // Network / connectivity error
                submitBtn.innerHTML           = '<i class="ri-error-warning-line"></i> Network Error';
                submitBtn.style.background    = '#A4262C';
                alert('Network error. Please check your connection and try again.');

                setTimeout(function () {
                    submitBtn.innerHTML        = originalHTML;
                    submitBtn.disabled         = false;
                    submitBtn.style.background = '';
                }, 2000);
            }
        });
    }

    /* ── 3. Protect selected media from casual copying ───────── */
    const protectedMedia = document.querySelectorAll('.protected-media');

    if (protectedMedia.length) {
        const blockEvent = function (e) {
            e.preventDefault();
        };

        protectedMedia.forEach(function (media) {
            media.setAttribute('draggable', 'false');
            media.addEventListener('contextmenu', blockEvent);
            media.addEventListener('dragstart', blockEvent);
            media.addEventListener('selectstart', blockEvent);
            media.addEventListener('copy', blockEvent);
            media.addEventListener('cut', blockEvent);
        });
    }

}());
