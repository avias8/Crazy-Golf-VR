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

    // Course showcase: one stage and a tab per course. It advances on its own while on screen (the active tab's
    // progress bar is the timer, so hovering or focusing pauses it) until the visitor picks a course.
    // Only the shown course's clip loads and plays; reduced motion keeps the posters and never advances.
    const showcase = document.querySelector('[data-showcase]');
    if (showcase) {
        const tabs = [...showcase.querySelectorAll('[role="tab"]')];
        const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
        let current = 0;
        let onScreen = !('IntersectionObserver' in window);
        let auto = !reduce.matches;

        const sync = () => panels.forEach((panel, i) => {
            const clip = panel.querySelector('video');
            if (i === current && onScreen && !reduce.matches) clip.play().catch(() => {});
            else clip.pause();
        });
        const select = (index, focus) => {
            current = (index + tabs.length) % tabs.length;
            tabs.forEach((tab, i) => {
                const on = i === current;
                tab.setAttribute('aria-selected', String(on));
                tab.tabIndex = on ? 0 : -1;
                panels[i].classList.toggle('is-active', on);
            });
            if (focus) tabs[current].focus();
            showcase.classList.remove('is-auto');
            if (auto) { void showcase.offsetWidth; showcase.classList.add('is-auto'); }
            sync();
        };
        const stopAuto = () => { auto = false; showcase.classList.remove('is-auto'); };

        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => { stopAuto(); select(i); });
            tab.addEventListener('keydown', (event) => {
                const target = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 }[event.key];
                if (target === undefined) return;
                event.preventDefault();
                stopAuto();
                select(target, true);
            });
        });
        showcase.addEventListener('animationend', (event) => {
            if (auto && event.target.classList.contains('showcase__progress')) select(current + 1);
        });
        const pause = (paused) => showcase.classList.toggle('is-paused', paused);
        showcase.addEventListener('pointerenter', () => pause(true));
        showcase.addEventListener('pointerleave', () => pause(false));
        showcase.addEventListener('focusin', () => pause(true));
        showcase.addEventListener('focusout', () => pause(false));
        reduce.addEventListener?.('change', () => { if (reduce.matches) stopAuto(); sync(); });

        if (!onScreen) {
            new IntersectionObserver(([entry]) => {
                onScreen = entry.isIntersecting;
                showcase.classList.toggle('is-offscreen', !onScreen);
                sync();
            }, { threshold: 0.3 }).observe(showcase);
        }
        showcase.classList.add('is-live');
        select(0);
        requestAnimationFrame(() => requestAnimationFrame(() => showcase.classList.add('is-ready')));
    }
})();
