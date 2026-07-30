<?php
/**
 * Admin term-meta fields for the WooCommerce product category (product_cat).
 *
 * Registers three fields used by the collection blocks:
 *   - kgm_lifestyle_image_id  (attachment id, media picker)
 *   - kgm_collection_headline (text)
 *   - kgm_collection_intro    (textarea / plain text)
 *
 * Included from the main plugin file. Defines hooks at file scope; no return.
 *
 * @package SGB
 */

defined('ABSPATH') || exit;

/**
 * Field labels/descriptions shared by the Add and Edit screens.
 */
if ( ! function_exists( 'sgb_term_meta_labels' ) ) {
    function sgb_term_meta_labels() {
        return [
            'image_label'    => __( 'Lifestyle Image', 'sidekick-gutenberg-blocks' ),
            'image_desc'     => __( 'Background/lifestyle image shown in the collection hero.', 'sidekick-gutenberg-blocks' ),
            'image_select'   => __( 'Select image', 'sidekick-gutenberg-blocks' ),
            'image_remove'   => __( 'Remove image', 'sidekick-gutenberg-blocks' ),
            'headline_label' => __( 'Collection Headline', 'sidekick-gutenberg-blocks' ),
            'headline_desc'  => __( 'Short headline shown in the collection intro.', 'sidekick-gutenberg-blocks' ),
            'intro_label'    => __( 'Collection Intro', 'sidekick-gutenberg-blocks' ),
            'intro_desc'     => __( 'Introductory copy shown beneath the headline.', 'sidekick-gutenberg-blocks' ),
        ];
    }
}

/**
 * Add screen ("Add new category") — uses <div class="form-field"> markup.
 */
add_action( 'product_cat_add_form_fields', function () {
    $labels = sgb_term_meta_labels();

    wp_nonce_field( 'sgb_term_meta_save', 'sgb_term_meta_nonce' );
    ?>
    <div class="form-field sgb-term-field sgb-term-field--image">
        <label><?php echo esc_html( $labels['image_label'] ); ?></label>
        <div class="sgb-term-media">
            <div class="sgb-term-media__preview">
                <img src="" alt="" style="display:none;max-width:150px;height:auto;" />
            </div>
            <input type="hidden" name="kgm_lifestyle_image_id" class="sgb-term-media__id" value="" />
            <button type="button" class="button sgb-term-media__select"><?php echo esc_html( $labels['image_select'] ); ?></button>
            <button type="button" class="button sgb-term-media__remove" style="display:none;"><?php echo esc_html( $labels['image_remove'] ); ?></button>
        </div>
        <p><?php echo esc_html( $labels['image_desc'] ); ?></p>
    </div>

    <div class="form-field sgb-term-field">
        <label for="kgm_collection_headline"><?php echo esc_html( $labels['headline_label'] ); ?></label>
        <input type="text" name="kgm_collection_headline" id="kgm_collection_headline" value="" />
        <p><?php echo esc_html( $labels['headline_desc'] ); ?></p>
    </div>

    <div class="form-field sgb-term-field">
        <label for="kgm_collection_intro"><?php echo esc_html( $labels['intro_label'] ); ?></label>
        <textarea name="kgm_collection_intro" id="kgm_collection_intro" rows="4" cols="50"></textarea>
        <p><?php echo esc_html( $labels['intro_desc'] ); ?></p>
    </div>
    <?php
} );

/**
 * Edit screen ("Edit category") — uses the WooCommerce two-column
 * <tr class="form-field"> table row markup. $term is passed by the hook.
 */
add_action( 'product_cat_edit_form_fields', function ( $term ) {
    $labels = sgb_term_meta_labels();

    $image_id = (int) get_term_meta( $term->term_id, 'kgm_lifestyle_image_id', true );
    $headline = (string) get_term_meta( $term->term_id, 'kgm_collection_headline', true );
    $intro    = (string) get_term_meta( $term->term_id, 'kgm_collection_intro', true );

    $image_src = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';

    wp_nonce_field( 'sgb_term_meta_save', 'sgb_term_meta_nonce' );
    ?>
    <tr class="form-field sgb-term-field sgb-term-field--image">
        <th scope="row"><label><?php echo esc_html( $labels['image_label'] ); ?></label></th>
        <td>
            <div class="sgb-term-media">
                <div class="sgb-term-media__preview">
                    <img
                        src="<?php echo esc_url( $image_src ); ?>"
                        alt=""
                        style="max-width:150px;height:auto;<?php echo $image_src ? '' : 'display:none;'; ?>"
                    />
                </div>
                <input type="hidden" name="kgm_lifestyle_image_id" class="sgb-term-media__id" value="<?php echo esc_attr( $image_id ? $image_id : '' ); ?>" />
                <button type="button" class="button sgb-term-media__select"><?php echo esc_html( $labels['image_select'] ); ?></button>
                <button type="button" class="button sgb-term-media__remove" style="<?php echo $image_id ? '' : 'display:none;'; ?>"><?php echo esc_html( $labels['image_remove'] ); ?></button>
            </div>
            <p class="description"><?php echo esc_html( $labels['image_desc'] ); ?></p>
        </td>
    </tr>

    <tr class="form-field sgb-term-field">
        <th scope="row"><label for="kgm_collection_headline"><?php echo esc_html( $labels['headline_label'] ); ?></label></th>
        <td>
            <input type="text" name="kgm_collection_headline" id="kgm_collection_headline" value="<?php echo esc_attr( $headline ); ?>" />
            <p class="description"><?php echo esc_html( $labels['headline_desc'] ); ?></p>
        </td>
    </tr>

    <tr class="form-field sgb-term-field">
        <th scope="row"><label for="kgm_collection_intro"><?php echo esc_html( $labels['intro_label'] ); ?></label></th>
        <td>
            <textarea name="kgm_collection_intro" id="kgm_collection_intro" rows="5" cols="50"><?php echo esc_textarea( $intro ); ?></textarea>
            <p class="description"><?php echo esc_html( $labels['intro_desc'] ); ?></p>
        </td>
    </tr>
    <?php
} );

/**
 * Persist the term meta on create + edit.
 */
if ( ! function_exists( 'sgb_save_product_cat_meta' ) ) {
    function sgb_save_product_cat_meta( $term_id ) {
        // Verify the nonce printed by the form fields above.
        if (
            ! isset( $_POST['sgb_term_meta_nonce'] ) ||
            ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sgb_term_meta_nonce'] ) ), 'sgb_term_meta_save' )
        ) {
            return;
        }

        // Defense in depth: only users who can manage product categories may write
        // (created_/edited_product_cat can also fire from imports / REST paths).
        if ( ! current_user_can( 'manage_product_terms' ) && ! current_user_can( 'manage_categories' ) ) {
            return;
        }

        // Lifestyle image id (attachment id).
        if ( isset( $_POST['kgm_lifestyle_image_id'] ) ) {
            $image_id = absint( wp_unslash( $_POST['kgm_lifestyle_image_id'] ) );
            if ( $image_id ) {
                update_term_meta( $term_id, 'kgm_lifestyle_image_id', $image_id );
            } else {
                delete_term_meta( $term_id, 'kgm_lifestyle_image_id' );
            }
        }

        // Headline (plain text).
        if ( isset( $_POST['kgm_collection_headline'] ) ) {
            $headline = sanitize_text_field( wp_unslash( $_POST['kgm_collection_headline'] ) );
            if ( '' !== $headline ) {
                update_term_meta( $term_id, 'kgm_collection_headline', $headline );
            } else {
                delete_term_meta( $term_id, 'kgm_collection_headline' );
            }
        }

        // Intro (textarea / plain text).
        if ( isset( $_POST['kgm_collection_intro'] ) ) {
            $intro = sanitize_textarea_field( wp_unslash( $_POST['kgm_collection_intro'] ) );
            if ( '' !== $intro ) {
                update_term_meta( $term_id, 'kgm_collection_intro', $intro );
            } else {
                delete_term_meta( $term_id, 'kgm_collection_intro' );
            }
        }
    }
}

add_action( 'created_product_cat', 'sgb_save_product_cat_meta' );
add_action( 'edited_product_cat', 'sgb_save_product_cat_meta' );

/**
 * Enqueue the media library + a lean inline script wiring the Select/Remove
 * buttons. Gated to the product_cat add/edit screens only.
 */
add_action( 'admin_enqueue_scripts', function () {
    if ( ! function_exists( 'get_current_screen' ) ) {
        return;
    }

    $screen = get_current_screen();
    if ( ! $screen || ! isset( $screen->taxonomy ) || 'product_cat' !== $screen->taxonomy ) {
        return;
    }

    wp_enqueue_media();

    $select_title  = esc_js( __( 'Select lifestyle image', 'sidekick-gutenberg-blocks' ) );
    $select_button = esc_js( __( 'Use this image', 'sidekick-gutenberg-blocks' ) );

    $script = <<<JS
( function () {
    function initField( wrapper ) {
        if ( ! wrapper || wrapper.dataset.sgbInit === '1' ) {
            return;
        }
        wrapper.dataset.sgbInit = '1';

        var input     = wrapper.querySelector( '.sgb-term-media__id' );
        var img       = wrapper.querySelector( '.sgb-term-media__preview img' );
        var selectBtn = wrapper.querySelector( '.sgb-term-media__select' );
        var removeBtn = wrapper.querySelector( '.sgb-term-media__remove' );
        var frame     = null;

        if ( ! input || ! selectBtn ) {
            return;
        }

        function setImage( id, url ) {
            input.value = id ? id : '';
            if ( img ) {
                if ( url ) {
                    img.src = url;
                    img.style.display = '';
                } else {
                    img.src = '';
                    img.style.display = 'none';
                }
            }
            if ( removeBtn ) {
                removeBtn.style.display = id ? '' : 'none';
            }
        }

        selectBtn.addEventListener( 'click', function ( e ) {
            e.preventDefault();
            if ( frame ) {
                frame.open();
                return;
            }
            frame = wp.media( {
                title: '{$select_title}',
                button: { text: '{$select_button}' },
                library: { type: 'image' },
                multiple: false
            } );
            frame.on( 'select', function () {
                var att = frame.state().get( 'selection' ).first().toJSON();
                var url = att.url;
                if ( att.sizes && att.sizes.medium ) {
                    url = att.sizes.medium.url;
                } else if ( att.sizes && att.sizes.thumbnail ) {
                    url = att.sizes.thumbnail.url;
                }
                setImage( att.id, url );
            } );
            frame.open();
        } );

        if ( removeBtn ) {
            removeBtn.addEventListener( 'click', function ( e ) {
                e.preventDefault();
                setImage( 0, '' );
            } );
        }
    }

    function initAll() {
        var wrappers = document.querySelectorAll( '.sgb-term-media' );
        for ( var i = 0; i < wrappers.length; i++ ) {
            initField( wrappers[ i ] );
        }
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', initAll );
    } else {
        initAll();
    }

    // The Add-category form is reset/re-rendered via AJAX after a term is added,
    // so re-init the fresh fields once the request completes.
    if ( window.jQuery ) {
        window.jQuery( document ).ajaxComplete( function () {
            initAll();
        } );
    }
} )();
JS;

    wp_add_inline_script( 'jquery-core', $script );
} );
