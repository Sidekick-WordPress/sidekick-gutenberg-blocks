const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, '');
    return normalized || '/';
};

const getHashTarget = (hash: string) => {
    const rawId = hash.replace(/^#/, '');
    if (!rawId) return null;

    let id = rawId;
    try {
        id = decodeURIComponent(rawId);
    } catch {
        id = rawId;
    }

    return document.getElementById(id);
};

const getSamePageHashTarget = (link: HTMLAnchorElement) => {
    if (!link.hash || link.hash === '#') return null;

    const url = new URL(link.href, window.location.href);
    const currentPath = normalizePath(window.location.pathname);
    const linkPath = normalizePath(url.pathname);
    const samePage =
        url.origin === window.location.origin &&
        linkPath === currentPath &&
        (url.search === window.location.search || url.search === '');

    if (!samePage) return null;

    const target = getHashTarget(url.hash);
    return target ? { target, hash: url.hash } : null;
};

const smoothScrollToTarget = (target: HTMLElement) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const style = window.getComputedStyle(target);
    const scrollMarginTop = parseFloat(style.scrollMarginTop) || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;

    window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const navMenus = document.querySelectorAll('.sgb-nav-menu') as NodeListOf<HTMLElement>;

    navMenus.forEach((navWrapper) => {
        const orientation = navWrapper.getAttribute('data-orientation');
        const navInner = navWrapper.querySelector('.sgb-nav-menu__inner') as HTMLElement;
        const toggleBtn = navWrapper.querySelector('.sgb-nav-menu__toggle');
        const closeBtn = navWrapper.querySelector('.sgb-nav-menu__close');

        if (!navInner) return;

        const closeMenu = () => {
            navWrapper.classList.remove('is-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore background scrolling
        };

        const navLinks = navInner.querySelectorAll<HTMLAnchorElement>('a[href]');

        navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    (link.target && link.target !== '_self')
                ) {
                    return;
                }

                const anchorTarget = getSamePageHashTarget(link);

                if (anchorTarget) {
                    event.preventDefault();
                    closeMenu();

                    if (window.location.hash !== anchorTarget.hash) {
                        window.history.pushState(null, '', anchorTarget.hash);
                    }

                    requestAnimationFrame(() => smoothScrollToTarget(anchorTarget.target));
                    return;
                }

                if (navWrapper.classList.contains('is-open')) {
                    closeMenu();
                }
            });
        });

        if (orientation === 'vertical') {
            navWrapper.classList.remove('is-mobile-menu', 'is-open');
            navWrapper.classList.add('is-initialized');
            return;
        }

        const parent = navWrapper.parentElement;
        if (!parent) return;

        const BUFFER = 40;
        let requiredDesktopWidth = 0;

        // --- Interaction Logic ---

        const openMenu = () => {
            navWrapper.classList.add('is-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        };

        if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        // --- Collision Logic ---

        const getOuterWidth = (el: Element): number => {
            const style = window.getComputedStyle(el);

            if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') {
                return 0;
            }

            const ml = parseFloat(style.marginLeft) || 0;
            const mr = parseFloat(style.marginRight) || 0;
            const rect = (el as HTMLElement).getBoundingClientRect();

            return rect.width + ml + mr;
        };

        const calculateRequiredWidth = () => {
            let totalSiblingWidth = 0;
            let visibleSiblings = 0;

            Array.from(parent.children).forEach((child) => {
                if (child === navWrapper) return;

                const width = getOuterWidth(child);
                if (width > 0) {
                    totalSiblingWidth += width;
                    visibleSiblings++;
                }
            });

            const parentStyle = window.getComputedStyle(parent);
            const gap = parseFloat(parentStyle.columnGap) || parseFloat(parentStyle.gap) || 0;
            const totalGapWidth = gap * visibleSiblings;

            if (window.getComputedStyle(navInner).display !== 'none') {
                const navDesktopWidth = getOuterWidth(navInner);
                return totalSiblingWidth + navDesktopWidth + totalGapWidth + BUFFER;
            }

            return requiredDesktopWidth;
        };

        const observer = new ResizeObserver((entries) => {
            const availableWidth = entries[0].contentRect.width;

            if (!navWrapper.classList.contains('is-mobile-menu')) {
                requiredDesktopWidth = calculateRequiredWidth();
            }

            if (availableWidth < requiredDesktopWidth && requiredDesktopWidth > 0) {
                navWrapper.classList.add('is-mobile-menu');
            } else {
                if (navWrapper.classList.contains('is-open')) {
                    closeMenu();
                }
                navWrapper.classList.remove('is-mobile-menu');
            }

            // NEW: Reveal the menu now that the layout is locked in
            if (!navWrapper.classList.contains('is-initialized')) {
                // requestAnimationFrame ensures the browser applies the mobile/desktop
                // classes to the DOM *before* turning the opacity back on.
                requestAnimationFrame(() => {
                    navWrapper.classList.add('is-initialized');
                });
            }
        });

        observer.observe(parent);
    });
});
