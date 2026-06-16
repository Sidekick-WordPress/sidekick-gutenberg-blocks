import namespace from '../../namespace';

const initBackgroundVideos = () => {
    const videos = Array.from(
        document.querySelectorAll<HTMLVideoElement>('video[data-sgb-bg-video]')
    );
    if (!videos.length) return;

    const pickUrl = (video: HTMLVideoElement) => {
        const w = window.innerWidth;
        const tabletBp = parseInt(video.dataset.tabletBp || '768', 10);
        const desktopBp = parseInt(video.dataset.desktopBp || '1024', 10);
        const mobile = video.dataset.bgMobile || '';
        const tablet = video.dataset.bgTablet || mobile;
        const desktop = video.dataset.bgDesktop || tablet;

        if (w >= desktopBp) return desktop || tablet || mobile;
        if (w >= tabletBp) return tablet || mobile;
        return mobile;
    };

    const applySrc = (video: HTMLVideoElement) => {
        const url = pickUrl(video);
        const current = video.getAttribute('src') || '';
        if (url === current) return;

        if (!url) {
            video.removeAttribute('src');
            video.load();
            return;
        }
        video.setAttribute('src', url);
        video.load();
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { /* autoplay blocked — first user interaction will resume */ });
        }
    };

    videos.forEach(applySrc);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => videos.forEach(applySrc), 150);
    });
};

const initColumnEntranceAnimations = () => {
    const animatedColumns = Array.from(
        document.querySelectorAll<HTMLElement>(`.wp-block-${namespace}-column.has-entrance-animation`)
    );

    if (!animatedColumns.length) return;

    const visibleClass = 'is-entrance-visible';
    const reveal = (column: HTMLElement) => column.classList.add(visibleClass);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        animatedColumns.forEach(reveal);
        return;
    }

    // entrance-ready class is added synchronously in <head> (php/enqueue-assets.php)
    // so columns are already hidden by the time this runs — no flash on initial paint.

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const column = entry.target as HTMLElement;
            reveal(column);
            observer.unobserve(column);
        });
    }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
    });

    animatedColumns.forEach((column) => observer.observe(column));
};

// NOTE: We intentionally do NOT mount ColumnsExtraLogic (the ResizeObserver) on
// the front-end. Its job is to toggle the `.is-*-layout` classes, which are
// EDITOR ONLY (see _save.scss) — the editor canvas isn't viewport-width, so the
// editor must measure the element. On the front-end the per-block <style> media
// queries (columns/save.php + column/save.php) are the single source of truth.
//
// Running the observer here previously desynced the layout: the child columns'
// width media queries use `!important` and follow the *viewport*, while the
// parent's `--current-max-width` media query is NOT `!important`, so the
// observer-toggled `.is-*-layout !important` rules overrode it and made the
// parent follow the *element* width (viewport minus scrollbar) instead. That
// scrollbar-width gap broke the layout in a ~10px window range. Letting the
// parent fall back to its media query keeps it in sync with the children.

initBackgroundVideos();
initColumnEntranceAnimations();
