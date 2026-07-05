// Vertical collapsible mode: sub-menus start closed and open via an injected
// toggle button. Collapsing uses an inline !important display so it beats the
// stylesheet's force-open vertical rules; expanding just removes it again.
//
// Shared by the front-end script (react.ts) and the editor preview (edit.tsx)
// so both render an identical toggle — the circle, ring, and spacing can only
// be judged while editing if the same button is present in both places.
// Because the buttons only exist once this runs, a no-JS visitor still gets the
// always-expanded menu and every link stays reachable.

let submenuIdCounter = 0;

interface CollapsibleOptions {
    // Decides whether a given parent item starts expanded. The front end opens
    // only the current page's trail; the editor preview opens everything so all
    // sub-menu styling stays visible.
    defaultOpen?: (item: HTMLElement) => boolean;
}

export const setupCollapsibleSubmenus = (
    navInner: HTMLElement,
    options: CollapsibleOptions = {}
) => {
    const defaultOpen =
        options.defaultOpen ??
        ((item: HTMLElement) => !!item.querySelector('[aria-current], .current-menu-item'));

    // Create nodes from the nav's OWN document. On the front end that's just
    // `document`, but in the WP 6.3+ editor the canvas is an iframe, so the
    // preview lives in a different document than the bundle's global `document`.
    const doc = navInner.ownerDocument;

    navInner.querySelectorAll('li').forEach((item) => {
        const submenu = item.querySelector(
            ':scope > .wp-block-navigation__submenu-container'
        ) as HTMLElement | null;
        if (!submenu) return;

        // Idempotency guard: never inject a second toggle into an item that
        // already has one. Essential in the editor, where a MutationObserver
        // re-runs this after every ServerSideRender refetch.
        if (item.querySelector(':scope > .sgb-nav-menu__submenu-toggle')) return;

        const link = item.querySelector(':scope > a, :scope > .wp-block-navigation-item__content');
        const label = link?.textContent?.trim();

        if (!submenu.id) {
            submenuIdCounter += 1;
            submenu.id = `sgb-nav-submenu-${submenuIdCounter}`;
        }

        const toggle = doc.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sgb-nav-menu__submenu-toggle';
        toggle.setAttribute('aria-controls', submenu.id);
        toggle.setAttribute('aria-label', label ? `Toggle sub-menu of ${label}` : 'Toggle sub-menu');

        const setOpen = (open: boolean) => {
            if (open) {
                submenu.style.removeProperty('display');
            } else {
                submenu.style.setProperty('display', 'none', 'important');
            }
            item.classList.toggle('is-submenu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        toggle.addEventListener('click', () => {
            setOpen(!item.classList.contains('is-submenu-open'));
        });

        setOpen(defaultOpen(item as HTMLElement));

        if (link) {
            link.after(toggle);
        } else {
            item.insertBefore(toggle, submenu);
        }
    });
};
