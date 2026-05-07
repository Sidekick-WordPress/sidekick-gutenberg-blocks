import { createRoot } from '@wordpress/element';
import type { ReactNode } from 'react';

import ColumnsExtraLogic from "./components/ColumnsExtraLogic";
import namespace from '../../namespace';

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

    document.documentElement.classList.add(`${namespace}-entrance-ready`);

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

const columnsBlocks = document.querySelectorAll(
    `.wp-block-${namespace}-columns`
);

columnsBlocks.forEach((block) => {
    // Cast to HTMLElement so we can access .dataset
    const blockMount = block.querySelector(`.${namespace}-block__mount`) as HTMLElement;

    if (blockMount && blockMount.dataset.attributes) {
        const
            attributes = JSON.parse(blockMount.dataset.attributes),
            root = createRoot(blockMount);

        root.render(
            (
                <ColumnsExtraLogic
                    attributes={attributes}
                    blockRef={block as HTMLElement}
                />
            ) as ReactNode
        );
    }
});

initColumnEntranceAnimations();
