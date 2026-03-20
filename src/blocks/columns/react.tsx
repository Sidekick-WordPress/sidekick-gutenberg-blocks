import { createRoot } from '@wordpress/element';
import type { ReactNode } from 'react';

import ColumnsExtraLogic from "./components/ColumnsExtraLogic";
import namespace from '../../namespace';

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
