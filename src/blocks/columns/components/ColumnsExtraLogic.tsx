import { useEffect } from '@wordpress/element';
import { CoreColumnsAttributes } from '../attributes';

interface LogicProps {
    attributes: CoreColumnsAttributes;
    blockRef?: HTMLElement | null;
}

const ColumnsExtraLogic = ({ attributes, blockRef }: LogicProps) => {
    const { tabletBreakpoint = 768, desktopBreakpoint = 1024 } = attributes;

    useEffect(() => {
        if (!blockRef) return;

        const onResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
                
                const isMobile = width < tabletBreakpoint;
                const isTablet = width >= tabletBreakpoint && width < desktopBreakpoint;
                const isDesktop = width >= desktopBreakpoint;

                blockRef.classList.toggle('is-mobile-layout', isMobile);
                blockRef.classList.toggle('is-tablet-layout', isTablet);
                blockRef.classList.toggle('is-desktop-layout', isDesktop);
            }
        };

        const observer = new ResizeObserver(onResize);

        observer.observe(blockRef);

        return () => {
            observer.disconnect();
        };

    }, [tabletBreakpoint, desktopBreakpoint, blockRef]);

    return null;
};

export default ColumnsExtraLogic;
