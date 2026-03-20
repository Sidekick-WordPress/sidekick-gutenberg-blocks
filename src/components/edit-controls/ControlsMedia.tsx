import {__} from '@wordpress/i18n';
import {PanelBody, RangeControl, ToggleControl, SelectControl, Button} from '@wordpress/components';
import {MediaUpload, MediaUploadCheck} from '@wordpress/block-editor';

// Plugin
import {sizeOptions, positionOptions, repeatOptions} from "../../models/attr-shapes/background-image";
import namespace from '../../namespace';

export interface ControlsMediaProps {
    panelLabel?: string;
    imageUrl: string;
    onSelectMedia: (media: any) => void;
    onRemoveMedia: () => void;
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

                    {!!imageUrl && (
                        <>
                            {!!onChangeParallax && parallax !== undefined && (
                                <ToggleControl
                                    label={__('Background Fixed Position', namespace)}
                                    checked={parallax}
                                    onChange={onChangeParallax}
                                />
                            )}

                            {!!onChangeOpacity && opacity !== undefined && (
                                <RangeControl
                                    label={__('Image Opacity (%)', namespace)}
                                    value={opacity}
                                    onChange={onChangeOpacity}
                                    min={0}
                                    max={100}
                                />
                            )}

                            {!!onChangeBackgroundSize && backgroundSize !== undefined && (
                                <SelectControl
                                    label={__('Background Size', namespace)}
                                    value={backgroundSize as any}
                                    options={sizeOptions}
                                    onChange={onChangeBackgroundSize}
                                />
                            )}

                            {!!onChangeBackgroundPosition && backgroundPosition !== undefined && (
                                <SelectControl
                                    label={__('Background Position', namespace)}
                                    value={backgroundPosition as any}
                                    options={positionOptions}
                                    onChange={onChangeBackgroundPosition}
                                />
                            )}

                            {!!onChangeBackgroundRepeat && backgroundRepeat !== undefined && (
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
