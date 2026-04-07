document.addEventListener('DOMContentLoaded', () => {
    const navMenus = document.querySelectorAll('.sgb-nav-menu') as NodeListOf<HTMLElement>;

    navMenus.forEach((navWrapper) => {
        const navInner = navWrapper.querySelector('.sgb-nav-menu__inner') as HTMLElement;
        const toggleBtn = navWrapper.querySelector('.sgb-nav-menu__toggle');
        const closeBtn = navWrapper.querySelector('.sgb-nav-menu__close');

        if (!navInner) return;

        const orientation = navInner.getAttribute('data-orientation');
        if (orientation === 'vertical') return;

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

        const closeMenu = () => {
            navWrapper.classList.remove('is-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore background scrolling
        };

        if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        // NEW: Grab all actual links inside the menu
        const navLinks = navInner.querySelectorAll('a');

        // NEW: Loop through them and add a click listener
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                // If the menu is currently open in mobile mode, close it instantly
                if (navWrapper.classList.contains('is-open')) {
                    closeMenu();
                }
            });
        });

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
                navWrapper.classList.remove('is-mobile-menu');
                // Safety Catch
                if (navWrapper.classList.contains('is-open')) {
                    closeMenu();
                }
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
