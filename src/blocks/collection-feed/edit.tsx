import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

// Plugin
import namespace from '../../namespace';

// The block renders nothing visible on the front end (just a JSON config
// <script>), so the editor shows an explanatory placeholder instead of a
// ServerSideRender of empty output.
export default function Edit() {
    const blockProps = useBlockProps({
        className: `${namespace}-collection-feed-placeholder`,
    });

    return (
        <div {...blockProps}>
            <strong>{__('Collection Feed (React)', namespace)}</strong>
            <p>
                {__(
                    'Invisible on the front end: intercepts filter & pagination clicks on this archive and refreshes the product grid from the Store API without a page reload.',
                    namespace
                )}
            </p>
        </div>
    );
}
