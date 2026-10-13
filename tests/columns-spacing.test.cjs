const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {spawnSync} = require('node:child_process');
const test = require('node:test');
const {transformSync} = require('@babel/core');

require.extensions['.ts'] = (module, filename) => {
    const result = transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, babelrc: false, configFile: false,
        presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
    });
    module._compile(result.code, filename);
};

const {
    getSpacingControlValues, getBasePaddingValues, recoverClearedColumnsPadding, ZERO_SPACING,
} = require('../src/blocks/columns/spacing.ts');
const {getResponsiveMargins} = require('../src/blocks/columns/margins.ts');
const {getPaddingStr} = require('../src/helpers/styles.ts');
const {parentAttributes} = require('../src/blocks/columns/attributes.ts');
const namespace = require('../src/namespace.ts').default;
const allSides = (value) => ({top: value, right: value, bottom: value, left: value});
const reload = (attributes) => JSON.parse(JSON.stringify(attributes));

// Exercise WordPress's actual schema parsing/default logic; no DOM is needed for
// comment-sourced attributes. The filter receives the original delimiter JSON.
const loadNativeAttributeParser = () => {
    const filename = path.resolve(__dirname, '../node_modules/@wordpress/blocks/src/api/parser/get-block-attributes.js');
    const result = transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, babelrc: false, configFile: false,
        presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
    });
    const loaded = new Module(filename, module);
    const mocks = {
        hpq: {parse: () => ({})},
        memize: callback => callback,
        '@wordpress/hooks': {applyFilters: (_hook, ...args) => recoverClearedColumnsPadding(...args)},
        '@wordpress/rich-text': {RichTextData: class {}},
        '../matchers': {},
        '../utils': {normalizeBlockType: value => value, getDefault: schema => schema.default},
    };
    loaded.require = request => {
        assert.ok(Object.hasOwn(mocks, request), `Unexpected parser dependency: ${request}`);
        return mocks[request];
    };
    loaded._compile(result.code, filename);
    return loaded.exports;
};

test('clearing base padding saves four explicit zero sides instead of an empty object', () => {
    for (const value of [undefined, null, {}, [], {top: '', right: undefined}]) {
        assert.deepEqual(reload(getBasePaddingValues(value)), ZERO_SPACING);
    }
    const partial = {top: '12px', bottom: '0'};
    assert.deepEqual(getBasePaddingValues(partial), {...ZERO_SPACING, top: '12px'});
    assert.deepEqual(partial, {top: '12px', bottom: '0'});
    const one = getBasePaddingValues({});
    one.top = '12px';
    assert.deepEqual(getBasePaddingValues({}), allSides('0'));
});

test('WordPress parsing recovers a saved empty array before its 20px default reaches the editor', () => {
    const parser = loadNativeAttributeParser();
    const blockType = {name: `${namespace}/columns`, attributes: parentAttributes};
    const raw = {mobilePadding: []};
    // Reproduce the failure: [] does not satisfy a JSON-schema object attribute.
    assert.deepEqual(parser.getBlockAttribute('mobilePadding', parentAttributes.mobilePadding, {}, raw, ''),
        allSides('20px'));
    const parsed = parser.getBlockAttributes(blockType, '', raw);
    assert.deepEqual(parsed.mobilePadding, ZERO_SPACING);
    assert.equal(getPaddingStr(parsed.mobilePadding), '0px 0px 0px 0px');
    assert.deepEqual(parser.getBlockAttributes(blockType, '', reload({mobilePadding: parsed.mobilePadding})).mobilePadding,
        ZERO_SPACING);
    assert.deepEqual(raw, {mobilePadding: []});
});

test('cleared padding recovery leaves new blocks, other blocks, and existing values unchanged', () => {
    const blockType = {name: `${namespace}/columns`};
    const original = {mobilePadding: allSides('20px'), mobileGap: 20};
    const snapshots = reload(original);
    for (const raw of [undefined, {}, {mobilePadding: allSides('20px')}, {mobilePadding: {top: '0'}},
        {mobilePadding: ['0']}, {mobilePadding: null}]) {
        assert.deepEqual(recoverClearedColumnsPadding(original, blockType, '', raw), snapshots);
    }
    for (const name of ['core/columns', `${namespace}/column`, 'other/columns']) {
        assert.deepEqual(recoverClearedColumnsPadding(original, {name}, '', {mobilePadding: []}), snapshots);
    }
    for (const empty of [[], {}]) {
        const raw = {mobilePadding: empty};
        const rawSnapshot = reload(raw);
        const recovered = recoverClearedColumnsPadding(original, blockType, '', raw);
        assert.deepEqual(recovered, {...snapshots, mobilePadding: ZERO_SPACING});
        assert.deepEqual(raw, rawSnapshot);
        assert.deepEqual(original, snapshots);
    }
    const parser = loadNativeAttributeParser();
    assert.deepEqual(parser.getBlockAttributes({...blockType, attributes: parentAttributes}, '', {}).mobilePadding,
        allSides('20px'));
});

test('explicit zero is preserved for native controls and CSS in every supported representation', () => {
    for (const zero of [0, '0', '0px', '0em', '0rem', '0%', '0.00px', '-0px', '+0px']) {
        assert.deepEqual(getSpacingControlValues(allSides(zero)), ZERO_SPACING);
        assert.equal(getPaddingStr(getSpacingControlValues(allSides(zero)), '20px'), '0px 0px 0px 0px');
    }
    assert.deepEqual(getSpacingControlValues(0), ZERO_SPACING);
    assert.equal(getPaddingStr(0, '20px'), '0px 0px 0px 0px');
});

test('the native None preset resolves to zero instead of an undefined CSS variable', () => {
    // WordPress 7.1 emits this synthetic preset when None is chosen in a select list.
    for (const none of ['var:preset|spacing|0', 'var(--wp--preset--spacing--0)']) {
        assert.deepEqual(getSpacingControlValues(allSides(none)), ZERO_SPACING);
        assert.equal(getPaddingStr(allSides(none), '20px'), '0px 0px 0px 0px');
    }
});

test('zero padding survives a save and reload across all breakpoints', () => {
    const attributes = reload({
        mobilePadding: getSpacingControlValues(allSides(0)),
        tabletPadding: getSpacingControlValues(allSides('var:preset|spacing|0')),
        padding: getSpacingControlValues(allSides('var(--wp--preset--spacing--0)')),
    });
    const loaded = {mobilePadding: parentAttributes.mobilePadding.default, ...attributes};
    for (const key of ['mobilePadding', 'tabletPadding', 'padding']) {
        assert.deepEqual(loaded[key], ZERO_SPACING);
        assert.equal(getPaddingStr(loaded[key], '20px'), '0px 0px 0px 0px');
    }
});

test('ordinary presets and custom spacing retain their values and CSS', () => {
    const values = {
        top: 'var:preset|spacing|40',
        right: 'var(--wp--preset--spacing--small)',
        bottom: '2rem',
        left: '12px',
    };
    const normalized = getSpacingControlValues(reload(values));
    assert.deepEqual(normalized, {...values, right: 'var:preset|spacing|small'});
    assert.equal(getPaddingStr(normalized),
        'var(--wp--preset--spacing--40) var(--wp--preset--spacing--small) 2rem 12px');
    assert.deepEqual(getSpacingControlValues({top: '-3%', left: 'calc(2rem + 4px)'}), {
        top: '-3%', left: 'calc(2rem + 4px)',
    });
});

test('cleared and missing spacing remains distinct from explicit zero', () => {
    for (const empty of [undefined, null, {}, {top: '', right: undefined, bottom: ' ', left: null}]) {
        assert.deepEqual(getSpacingControlValues(empty), {});
    }
    assert.deepEqual(getSpacingControlValues({top: '0', right: ''}), {top: '0'});
    assert.equal(getPaddingStr({top: '0'}, '20px'), '0px 20px 20px 20px');
    assert.deepEqual(parentAttributes.mobilePadding.default, allSides('20px'));
    assert.equal(Object.hasOwn(parentAttributes.tabletPadding, 'default'), false);
    assert.equal(Object.hasOwn(parentAttributes.padding, 'default'), false);
});

test('zero margin presets override inherited spacing while cleared tiers continue to inherit', () => {
    const attributes = reload({
        mobileMargin: allSides('20px'),
        tabletMargin: allSides('var:preset|spacing|0'),
        desktopMargin: {},
    });
    const zeroOverride = getResponsiveMargins(attributes);
    assert.deepEqual(zeroOverride.resolved.mobile, allSides('20px'));
    assert.deepEqual(zeroOverride.resolved.tablet, allSides('0px'));
    assert.deepEqual(zeroOverride.resolved.desktop, allSides('0px'));
    const clearedOverride = getResponsiveMargins({...attributes, tabletMargin: {}});
    assert.deepEqual(clearedOverride.resolved.tablet, allSides('20px'));
    assert.deepEqual(clearedOverride.resolved.desktop, allSides('20px'));
    const clearedBase = getResponsiveMargins(reload({
        mobileMargin: {}, style: {spacing: {margin: allSides('20px')}},
    }));
    assert.deepEqual(clearedBase.resolved, {mobile: {}, tablet: {}, desktop: {}});
});

test('PHP padding output matches the editor for zero, presets, and missing sides', {
    skip: process.env.PHP_BINARY ? false : 'Set PHP_BINARY to run PHP rendering checks',
}, () => {
    const values = [
        0,
        allSides(0),
        allSides('0'),
        allSides('0px'),
        allSides('var:preset|spacing|0'),
        allSides('var(--wp--preset--spacing--0)'),
        {top: 'var:preset|spacing|0', bottom: 'var:preset|spacing|40'},
        {top: 'var:preset|spacing|small', right: '2rem', bottom: '12px', left: '3%'},
        {},
    ];
    const php = [
        "define('ABSPATH', __DIR__);",
        'require $argv[1];',
        '$inputs = json_decode($argv[2], true);',
        "$outputs = array_map(function ($value) { return sgb_get_padding_str($value, '20px'); }, $inputs);",
        'echo json_encode($outputs);',
    ].join('\n');
    const result = spawnSync(process.env.PHP_BINARY, [
        '-r', php, path.resolve(__dirname, '../php/helpers.php'), JSON.stringify(values),
    ], {encoding: 'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), values.map(value => getPaddingStr(value, '20px')));
});
