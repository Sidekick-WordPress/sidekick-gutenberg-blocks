import { useEffect, useRef } from '@wordpress/element';
import { CoreColumnsAttributes } from '../attributes';

interface LogicProps {
    attributes: CoreColumnsAttributes;
    blockRef?: HTMLElement | null;
    onLayoutChange?: (layoutClass: string, width: number) => void;
}

const ColumnsExtraLogic = ({ attributes, blockRef, onLayoutChange }: LogicProps) => {
    const { tabletBreakpoint = 768, desktopBreakpoint = 1024 } = attributes;
    const onLayoutChangeRef = useRef(onLayoutChange);
    useEffect(() => { onLayoutChangeRef.current = onLayoutChange; });

    useEffect(() => {
        if (!blockRef) return;

        const onResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;

                let newClass: string;
                if (width < tabletBreakpoint) {
                    newClass = 'is-mobile-layout';
                } else if (width < desktopBreakpoint) {
                    newClass = 'is-tablet-layout';
                } else {
                    newClass = 'is-desktop-layout';
                }

                if (onLayoutChangeRef.current) {
                    onLayoutChangeRef.current(newClass, Math.round(width));
                } else {
                    blockRef.classList.toggle('is-mobile-layout', newClass === 'is-mobile-layout');
                    blockRef.classList.toggle('is-tablet-layout', newClass === 'is-tablet-layout');
                    blockRef.classList.toggle('is-desktop-layout', newClass === 'is-desktop-layout');
                }
            }
        };

        const observer = new ResizeObserver(onResize);
        observer.observe(blockRef);

        return () => observer.disconnect();

    }, [tabletBreakpoint, desktopBreakpoint, blockRef]);

    return null;
};

export default ColumnsExtraLogic;
