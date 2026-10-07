const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {transformSync} = require('@babel/core');

require.extensions['.ts'] = (module, filename) => {
    const result = transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, babelrc: false, configFile: false,
        presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
    });
    module._compile(result.code, filename);
};

const {migrateMenuStyles} = require('../src/blocks/nav-menu/migrate.ts');
const {desktopTypography, mobileTypography, typographyPresets} = require('../src/blocks/nav-menu/typography.ts');

test('font controls accept flat and origin-grouped WordPress presets', () => {
    const theme = {slug: 'body', name: 'Body', fontFamily: 'Arial'};
    const custom = {...theme, fontFamily: 'Georgia'};
    const fallback = {slug: 'default', fontFamily: 'serif'};
    assert.deepEqual(typographyPresets([theme]), [theme]);
    assert.deepEqual(typographyPresets({default:[fallback], theme:[theme], custom:[custom]}), [fallback, custom]);
    assert.deepEqual(typographyPresets({default:[fallback], theme:[theme]}, false), [theme]);
    assert.deepEqual(typographyPresets(undefined), []);
});

test('legacy typography migrates without replacing existing native values', () => {
    const migrated = migrateMenuStyles({fontWeight: '700', textTransform: 'uppercase', style: {typography: {fontWeight: '400', lineHeight: '1.4'}}});
    assert.deepEqual(desktopTypography(migrated), {fontWeight: '400', textTransform: 'uppercase', lineHeight: '1.4'});
    assert.equal(migrateMenuStyles(migrated), migrated);
});

test('saved native preset slugs retain precedence and other desktop settings', () => {
    assert.deepEqual(desktopTypography({fontFamily: 'body', fontSize: 'large', style: {typography: {fontSize: '16px', fontWeight: '600'}}}), {
        fontFamily: 'var:preset|font-family|body', fontSize: 'var:preset|font-size|large', fontWeight: '600',
    });
});

test('legacy mobile size is preserved until the new controls are changed', () => {
    assert.deepEqual(mobileTypography({mobileFontSize: 32}), {fontSize: '32px'});
    assert.deepEqual(mobileTypography({}), {fontSize: '24px'});
    assert.deepEqual(mobileTypography({mobileFontSize: 32, mobileMenuStyle: {typography: {fontSize: '2rem'}}}), {fontSize: '2rem'});
});

test('resetting mobile typography does not restore the old size', () => {
    const attributes = JSON.parse(JSON.stringify({mobileFontSize: 32, mobileMenuStyle: {typography: {}}}));
    assert.deepEqual(mobileTypography(attributes), {});
});

test('style migration preserves all four independent typography groups', () => {
    const attributes = {
        style: {typography: {fontSize: '18px', textDecoration: 'underline'}},
        subMenuStyle: {typography: {fontSize: '14px', textDecoration: 'none'}},
        mobileMenuStyle: {typography: {fontSize: '30px', lineHeight: '1.2'}},
        mobileSubMenuStyle: {typography: {fontSize: '20px', lineHeight: '1.6'}},
    };
    const migrated = migrateMenuStyles(attributes);
    for (const key of ['style', 'subMenuStyle', 'mobileMenuStyle', 'mobileSubMenuStyle']) {
        assert.deepEqual(migrated[key].typography, attributes[key].typography);
    }
    assert.deepEqual(attributes.subMenuStyle, {typography: {fontSize: '14px', textDecoration: 'none'}});
});
