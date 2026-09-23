const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const {transformFileSync} = require('@babel/core');

const filename = path.resolve(__dirname, '../src/blocks/nav-menu/migrate.ts');
const compiled = transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
});
const migrationModule = new Module(filename, module);
migrationModule.filename = filename;
migrationModule.paths = Module._nodeModulePaths(path.dirname(filename));
migrationModule._compile(compiled.code, filename);
const {migrateMenuStyles, DEFAULT_PADDING} = migrationModule.exports;

test('new menus initialize native padding and the submenu override', () => {
    const result = migrateMenuStyles({ref: 7});
    assert.deepEqual(result.style.spacing.padding, DEFAULT_PADDING);
    assert.deepEqual(result.subMenuStyle.spacing.padding, DEFAULT_PADDING);
    assert.equal(result.subMenuWidth, '240px');
    assert.equal(result.ref, 7);
});

test('legacy menus preserve distinct padding, typography, zeroes, width and radius', () => {
    const original = {
        parentPadding: {left: '0', right: '2rem'},
        subMenuPadding: {top: '3px', bottom: '0px'},
        textTransform: 'uppercase', fontWeight: '700',
        subMenuWidth: 360, subMenuBorderRadius: 12,
        style: {spacing: {padding: DEFAULT_PADDING, margin: {top: '2rem'}}, layout: {selfStretch: 'fill'}},
    };
    const result = migrateMenuStyles(original);
    assert.deepEqual(result.style.spacing.padding, original.parentPadding);
    assert.deepEqual(result.subMenuStyle.spacing.padding, original.subMenuPadding);
    assert.deepEqual(result.style.typography, {textTransform: 'uppercase', fontWeight: '700'});
    assert.deepEqual(result.style.spacing.margin, {top: '2rem'});
    assert.deepEqual(result.style.layout, {selfStretch: 'fill'});
    assert.equal(result.subMenuStyle.border.radius, '12px');
    assert.equal(result.subMenuWidth, '360px');
    const serialized = JSON.parse(JSON.stringify(result));
    for (const key of ['parentPadding', 'subMenuPadding', 'textTransform', 'fontWeight', 'subMenuBorderRadius']) {
        assert.equal(Object.hasOwn(serialized, key), false);
    }
    assert.equal(original.fontWeight, '700'); // No mutation of editor attributes.
});

test('existing native typography and corner values take precedence', () => {
    const result = migrateMenuStyles({
        fontWeight: '700', textTransform: 'uppercase',
        style: {typography: {fontWeight: '400', textTransform: 'none', fontSize: '2rem'}},
        subMenuBorderRadius: 20,
        subMenuStyle: {border: {radius: {topLeft: '1em', bottomRight: '3px'}}},
        subMenuWidth: 'min(24rem, 80vw)',
    });
    assert.equal(result.style.typography.fontWeight, '400');
    assert.equal(result.style.typography.textTransform, 'none');
    assert.equal(result.style.typography.fontSize, '2rem');
    assert.deepEqual(result.subMenuStyle.border.radius, {topLeft: '1em', bottomRight: '3px'});
    assert.equal(result.subMenuWidth, 'min(24rem, 80vw)');
});

test('reset styles stay reset on subsequent edits and after a serialization round trip', () => {
    const result = migrateMenuStyles({parentPadding: {top: '99px'}, fontWeight: '900'});
    result.style = {spacing: {margin: {bottom: '1rem'}}};
    result.subMenuStyle = {};
    const reloaded = JSON.parse(JSON.stringify(result));
    assert.strictEqual(migrateMenuStyles(reloaded), reloaded);
    assert.equal(reloaded.style.spacing.padding, undefined);
    assert.equal(reloaded.style.typography, undefined);
    assert.deepEqual(reloaded.subMenuStyle, {});
});

test('clearing the last native style persists an empty style instead of restoring insertion defaults', () => {
    const result = migrateMenuStyles({styleVersion: 1, style: undefined});
    assert.deepEqual(JSON.parse(JSON.stringify(result)).style, {});
    assert.strictEqual(migrateMenuStyles(result), result);
});
