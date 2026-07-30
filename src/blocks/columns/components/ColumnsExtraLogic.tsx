import { useEffect, useRef } from '@wordpress/element';
import { CoreColumnsAttributes } from '../attributes';

interface LogicProps {
    attributes: CoreColumnsAttributes;
    blockRef?: HTMLElement | null;
    onLayoutChange?: (layoutClass: string, width: number) => void;
}

const getPreviewElement = (blockRef: HTMLElement): HTMLElement => {
    const ownerDocument = blockRef.ownerDocument;

    // In the iframe editor, documentElement is the preview viewport. In the
    // legacy non-iframe editor, use the shared canvas rather than an individual
    // block's width. Measuring a nested columns block itself makes its tier
    // change when an outer column changes width, even though frontend media
    // queries are viewport-based.
    if (ownerDocument.defaultView?.frameElement) {
        return ownerDocument.documentElement;
    }

    return blockRef.closest<HTMLElement>('.editor-styles-wrapper')
        ?? ownerDocument.documentElement;
};

const ColumnsExtraLogic = ({ attributes, blockRef, onLayoutChange }: LogicProps) => {
    const { tabletBreakpoint = 768, desktopBreakpoint = 1024 } = attributes;
    const onLayoutChangeRef = useRef(onLayoutChange);
    useEffect(() => { onLayoutChangeRef.current = onLayoutChange; });

    useEffect(() => {
        if (!blockRef) return;

        const previewElement = getPreviewElement(blockRef);

        const onResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                const width = entry.target === entry.target.ownerDocument.documentElement
                    ? entry.target.ownerDocument.defaultView?.innerWidth
                        ?? entry.target.ownerDocument.documentElement.clientWidth
                    : entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;

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
        observer.observe(previewElement);

        return () => observer.disconnect();

    }, [tabletBreakpoint, desktopBreakpoint, blockRef]);

    return null;
};

export default ColumnsExtraLogic;
