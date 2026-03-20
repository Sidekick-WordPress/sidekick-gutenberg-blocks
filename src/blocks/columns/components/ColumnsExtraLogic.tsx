import { useEffect } from '@wordpress/element';
import { CoreColumnsAttributes } from '../attributes';

interface LogicProps {
    attributes: CoreColumnsAttributes;
    blockRef?: HTMLElement | null;
}

const ColumnsExtraLogic = ({ attributes, blockRef }: LogicProps) => {
    const { desktopBreakpoint = 768 } = attributes;

    useEffect(() => {
        if (!blockRef) return;

        const onResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
                const isMobile = width < desktopBreakpoint;

                if (isMobile) {
                    blockRef.classList.add('is-mobile-layout');
                    blockRef.classList.remove('is-desktop-layout');
                } else {
                    blockRef.classList.add('is-desktop-layout');
                    blockRef.classList.remove('is-mobile-layout');
                }
            }
        };

        const observer = new ResizeObserver(onResize);

        observer.observe(blockRef);

        return () => {
            observer.disconnect();
        };

    }, [desktopBreakpoint, blockRef]);

    return null;
};

export default ColumnsExtraLogic;
