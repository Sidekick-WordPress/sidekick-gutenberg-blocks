import {__} from '@wordpress/i18n';
import {PanelBody, RangeControl, ToggleControl, SelectControl, Button, FocalPointPicker} from '@wordpress/components';
import {MediaUpload, MediaUploadCheck} from '@wordpress/block-editor';

// Plugin
import {sizeOptions, repeatOptions} from "../../models/attr-shapes/background-image";
import namespace from '../../namespace';

const parseFocalPoint = (position: string | undefined): { x: number; y: number } => {
    if (!position || position === 'center') return { x: 0.5, y: 0.5 };
    const keywordMap: Record<string, { x: number; y: number }> = {
        'top':          { x: 0.5, y: 0 },
        'bottom':       { x: 0.5, y: 1 },
        'left':         { x: 0,   y: 0.5 },
        'right':        { x: 1,   y: 0.5 },
        'top left':     { x: 0,   y: 0 },
        'top right':    { x: 1,   y: 0 },
        'bottom left':  { x: 0,   y: 1 },
        'bottom right': { x: 1,   y: 1 },
    };
    if (keywordMap[position]) return keywordMap[position];
    const parts = position.split(' ');
    const parse = (v: string) => v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v);
    const x = parts[0] !== undefined ? parse(parts[0]) : 0.5;
    const y = parts[1] !== undefined ? parse(parts[1]) : 0.5;
    return { x: isNaN(x) ? 0.5 : x, y: isNaN(y) ? 0.5 : y };
};

const focalPointToCss = (fp: { x: number; y: number }): string =>
    `${Math.round(fp.x * 100)}% ${Math.round(fp.y * 100)}%`;

export interface ControlsMediaProps {
    panelLabel?: string;
    imageUrl: string;
    onSelectMedia: (media: any) => void;
    onRemoveMedia: () => void;
    videoUrl?: string;
    onSelectVideo?: (media: any) => void;
    onRemoveVideo?: () => void;
    opacity?: number;
    onChangeOpacity?: (value: number) => void;
    parallax?: boolean;
    onChangeParallax?: (value: boolean) => void;
    backgroundSize?: string;
    onChangeBackgroundSize?: (value: string) => void;
    backgroundPosition?: string;
    onChangeBackgroundPosition?: (value: string) => void;
    backgroundRepeat?: string;
    onChangeBackgroundRepeat?: (value: string) => void;
}

export default function ControlsMedia(
    {
        panelLabel = __('Background Media', namespace),
        imageUrl,
        onSelectMedia,
        onRemoveMedia,
        videoUrl,
        onSelectVideo,
        onRemoveVideo,
        opacity,
        onChangeOpacity,
        parallax,
        onChangeParallax,
        backgroundSize,
        onChangeBackgroundSize,
        backgroundPosition,
        onChangeBackgroundPosition,
        backgroundRepeat,
        onChangeBackgroundRepeat
    }: ControlsMediaProps) {

    return (
        <PanelBody title={panelLabel} initialOpen={false}>
            {/* The outer 'as any' wrapper forces PanelBody to accept the children regardless of React version mismatches */}
            {(
                <div className={`${namespace}-background-settings-wrapper`}>
                    <div style={{marginBottom: '20px'}}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectMedia}
                                allowedTypes={['image']}
                                render={(({open}: any) => (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                        {imageUrl ? (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt={__('Background Preview', namespace)}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        borderRadius: '4px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <div style={{display: 'flex', gap: '10px'}}>
                                                    <Button variant="secondary" onClick={open}>
                                                        {__('Replace Image', namespace)}
                                                    </Button>
                                                    <Button variant="link" isDestructive onClick={onRemoveMedia}>
                                                        {__('Remove', namespace)}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <Button variant="primary" onClick={open} icon="format-image">
                                                {__('Choose Media', namespace)}
                                            </Button>
                                        )}
                                    </div>
                                )) as any}
                            />
                        </MediaUploadCheck>
                    </div>

                    {!!onSelectVideo && (
                        <div style={{marginBottom: '20px'}}>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={onSelectVideo}
                                    allowedTypes={['video']}
                                    render={(({open}: any) => (
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                            {videoUrl ? (
                                                <>
                                                    <video
                                                        src={videoUrl}
                                                        muted
                                                        loop
                                                        playsInline
                                                        autoPlay
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ddd',
                                                            background: '#000'
                                                        }}
                                                    />
                                                    <div style={{display: 'flex', gap: '10px'}}>
                                                        <Button variant="secondary" onClick={open}>
                                                            {__('Replace Video', namespace)}
                                                        </Button>
                                                        {!!onRemoveVideo && (
                                                            <Button variant="link" isDestructive onClick={onRemoveVideo}>
                                                                {__('Remove', namespace)}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <Button variant="secondary" onClick={open} icon="format-video">
                                                    {__('Choose Background Video', namespace)}
                                                </Button>
                                            )}
                                        </div>
                                    )) as any}
                                />
                            </MediaUploadCheck>
                        </div>
                    )}

                    {(!!imageUrl || !!videoUrl) && (
                        <>
                            {!!imageUrl && !!onChangeParallax && parallax !== undefined && (
                                <ToggleControl
                                    label={__('Background Fixed Position', namespace)}
                                    checked={parallax}
                                    onChange={onChangeParallax}
                                />
                            )}

                            {!!onChangeOpacity && opacity !== undefined && (
                                <RangeControl
                                    label={__('Media Opacity (%)', namespace)}
                                    value={opacity}
                                    onChange={onChangeOpacity}
                                    min={0}
                                    max={100}
                                />
                            )}

                            {!!imageUrl && !!onChangeBackgroundSize && backgroundSize !== undefined && (
                                <SelectControl
                                    label={__('Background Size', namespace)}
                                    value={backgroundSize as any}
                                    options={sizeOptions}
                                    onChange={onChangeBackgroundSize}
                                />
                            )}

                            {!!imageUrl && !!onChangeBackgroundPosition && backgroundPosition !== undefined && (
                                <FocalPointPicker
                                    label={__('Background Position', namespace)}
                                    url={imageUrl}
                                    value={parseFocalPoint(backgroundPosition)}
                                    onChange={(fp) => onChangeBackgroundPosition(focalPointToCss(fp))}
                                />
                            )}

                            {!!imageUrl && !!onChangeBackgroundRepeat && backgroundRepeat !== undefined && (
                                <SelectControl
                                    label={__('Background Repeat', namespace)}
                                    value={backgroundRepeat as any}
                                    options={repeatOptions}
                                    onChange={onChangeBackgroundRepeat}
                                />
                            )}
                        </>
                    )}
                </div>
            ) as any}
        </PanelBody>
    );
}
