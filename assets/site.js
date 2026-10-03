// Mobile menu, solid navigation after the hero, and a still hero for reduced motion.
(() => {
    const nav = document.querySelector('[data-nav]');
    const toggle = document.querySelector('[data-nav-toggle]');

    if (nav && toggle) {
        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            nav.toggleAttribute('data-open', open);
        };
        toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
        nav.querySelectorAll('.nav__menu a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });

        const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    const video = document.querySelector('[data-hero-video]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => {
        if (!video) return;
        if (reduce.matches) { video.pause(); video.removeAttribute('autoplay'); }
        else { video.play().catch(() => {}); }
    };
    applyMotion();
    reduce.addEventListener?.('change', applyMotion);

    // Feature loops load and play only while on screen, and stay on their poster for reduced motion.
    const loops = document.querySelectorAll('[data-autoplay-video]');
    if (loops.length && 'IntersectionObserver' in window) {
        const watcher = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting && !reduce.matches) target.play().catch(() => {});
            else target.pause();
        }), { threshold: 0.35 });
        loops.forEach((loop) => watcher.observe(loop));
    }
})();
