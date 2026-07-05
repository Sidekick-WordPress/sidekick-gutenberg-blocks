import { setupCollapsibleSubmenus } from './collapsible';

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
        const overlay = navWrapper.querySelector('.sgb-nav-menu__overlay') as HTMLElement | null;
        const toggleBtn = navWrapper.querySelector('.sgb-nav-menu__toggle');
        const closeBtn = navWrapper.querySelector('.sgb-nav-menu__close');

        if (!navInner) return;

        // State classes are mirrored onto the overlay because it gets portaled
        // to <body> in mobile mode, where nav-rooted CSS can't reach it.
        const setState = (className: string, enabled: boolean) => {
            navWrapper.classList.toggle(className, enabled);
            if (overlay) overlay.classList.toggle(className, enabled);
        };

        const closeMenu = () => {
            setState('is-open', false);
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
            if (navWrapper.classList.contains('sgb-nav-menu--collapsible')) {
                setupCollapsibleSubmenus(navInner);
            }
            setState('is-mobile-menu', false);
            setState('is-open', false);
            setState('is-initialized', true);
            return;
        }

        const parent = navWrapper.parentElement;
        if (!parent) return;

        const BUFFER = 40;
        let requiredDesktopWidth = 0;

        // --- Interaction Logic ---

        const openMenu = () => {
            setState('is-open', true);
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        };

        // --- Portal Logic ---
        // An ancestor with transform/filter/backdrop-filter/contain becomes the
        // containing block for position:fixed, which traps the fullscreen
        // overlay at the header's size. Moving the overlay to <body> while in
        // mobile mode restores viewport-relative positioning.

        // Typography set on the nav (block supports / theme) must travel with
        // the overlay since it can no longer inherit it once detached.
        const INHERITED_TYPE_PROPS = [
            'font-family',
            'font-size',
            'font-style',
            'font-weight',
            'letter-spacing',
            'text-decoration-line',
        ];

        const detachOverlay = () => {
            if (!overlay || overlay.parentElement === document.body) return;

            const navStyle = window.getComputedStyle(navWrapper);
            INHERITED_TYPE_PROPS.forEach((prop) => {
                overlay.style.setProperty(prop, navStyle.getPropertyValue(prop));
            });

            document.body.appendChild(overlay);
        };

        const reattachOverlay = () => {
            if (!overlay || overlay.parentElement !== document.body) return;

            INHERITED_TYPE_PROPS.forEach((prop) => {
                overlay.style.removeProperty(prop);
            });

            navWrapper.appendChild(overlay);
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
                // Class goes on first so the overlay is already styled as a
                // hidden fixed layer the moment it lands in <body>.
                setState('is-mobile-menu', true);
                detachOverlay();
            } else {
                if (navWrapper.classList.contains('is-open')) {
                    closeMenu();
                }
                setState('is-mobile-menu', false);
                reattachOverlay();
            }

            // NEW: Reveal the menu now that the layout is locked in
            if (!navWrapper.classList.contains('is-initialized')) {
                // requestAnimationFrame ensures the browser applies the mobile/desktop
                // classes to the DOM *before* turning the opacity back on.
                requestAnimationFrame(() => {
                    setState('is-initialized', true);
                });
            }
        });

        observer.observe(parent);
    });
});
