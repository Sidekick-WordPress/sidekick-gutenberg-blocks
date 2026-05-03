# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — development build with webpack watch mode and livereload
- `npm run build` — production build (minified, no watch)

No test or lint scripts are configured.

## Architecture

This is a WordPress Gutenberg block plugin. Blocks are written in TypeScript/React and rendered server-side via PHP.

### PHP Entry Points

- `sidekick-gutenberg-blocks.php` — plugin root; reads namespace from `namespace.json` and loads three modules
- `php/register-blocks.php` — scans `src/blocks/*/` for `block.json` + `save.php` and registers dynamic blocks
- `php/enqueue-assets.php` — enqueues built JS/CSS; uses file mtime for cache busting
- `php/helpers.php` — shared CSS-generation helpers (`sgb_get_padding_str`, `sgb_get_border_styles`)

### JS/TS Entry Points (webpack)

- `src/blocks.ts` — imports all block `index.ts` files, compiled to `build/js/blocks.min.js` (editor only)
- `src/react.ts` — shared React logic, compiled to `build/js/react.min.js` (front + editor)
- `src/styles/blocks-edit.scss` → `build/css/blocks-edit.css`
- `src/styles/blocks-save.scss` → `build/css/blocks-save.css`

### Block Anatomy

Each block lives in `src/blocks/[block-name]/` and follows this structure:

```
index.ts          # registerBlockType() call
attributes.ts     # TypeScript attribute definitions
edit.tsx          # Gutenberg editor component
save.tsx          # React save component (may be null for dynamic blocks)
save.php          # Server-side render callback
_edit.scss        # Editor styles (imported by blocks-edit.scss)
_save.scss        # Frontend styles (imported by blocks-save.scss)
block.json        # WordPress block metadata (optional)
components/       # Block-specific sub-components (optional)
```

### Namespace

`namespace.json` is the single source of truth for the block prefix (default: `sgb`). It is read by webpack (injected into SCSS as a variable) and by the PHP plugin root. All block names are `sgb/[block-name]`.

### Shared Utilities

- `src/models/attr-shapes/` — TypeScript interfaces for common attribute patterns (padding, borders, etc.)
- `src/helpers/styles.ts` — helpers for parsing padding/margin values and CSS units
- `src/components/edit-controls/` — reusable Gutenberg sidebar control components

### Responsive Attributes

Many blocks support `mobile*`, `tablet*`, `desktop*` attribute variants (e.g., `mobilePadding`, `tabletGap`). Padding attributes accept either a pixel number or an object `{ top, right, bottom, left }` with optional unit fields.

### Webpack

Config lives in `webpack/`. `base.config.js` defines entries and loaders (TS, JSX, SCSS, images, fonts); `dev.config.js` adds watch/livereload; `prod.config.js` adds Terser minification. WordPress packages are externalized via `@wordpress/dependency-extraction-webpack-plugin`.
