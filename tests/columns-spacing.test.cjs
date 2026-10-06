const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const {transformFileSync} = require('@babel/core');

const loadTypeScript = (relativePath, mocks = {}) => {
    const filename = path.resolve(__dirname, relativePath);
    const compiled = transformFileSync(filename, {
        babelrc: false,
        configFile: false,
        presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
    });
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    const originalRequire = loaded.require.bind(loaded);
    loaded.require = (request) => Object.hasOwn(mocks, request) ? mocks[request] : originalRequire(request);
    loaded._compile(compiled.code, filename);
    return loaded.exports;
};

const margins = loadTypeScript('../src/blocks/columns/margins.ts');
const spacing = loadTypeScript('../src/blocks/columns/spacing.ts', {'./margins': margins});
const {getSpacingControlValues, ZERO_SPACING} = spacing;
const {getPaddingStr} = loadTypeScript('../src/helpers/styles.ts');
const {parentAttributes} = loadTypeScript('../src/blocks/columns/attributes.ts');
const reload = (attributes) => JSON.parse(JSON.stringify(attributes));
const allSides = (value) => ({top: value, right: value, bottom: value, left: value});

test('named spacing presets remain selected after save and reload at all breakpoints', () => {
    const attributes = reload({
        mobilePadding: allSides('var:preset|spacing|small'),
        tabletPadding: allSides('var:preset|spacing|50'),
        padding: allSides('var:preset|spacing|x-large'),
        mobileMargin: allSides('var:preset|spacing|small'),
        tabletMargin: allSides('var:preset|spacing|50'),
        desktopMargin: allSides('var:preset|spacing|x-large'),
    });
    for (const values of Object.values(attributes)) {
        assert.deepEqual(getSpacingControlValues(values), values);
    }

    const resolved = margins.getResponsiveMargins(attributes);
    for (const [tier, key] of [
        ['mobile', 'mobileMargin'], ['tablet', 'tabletMargin'], ['desktop', 'desktopMargin'],
    ]) {
        assert.deepEqual(getSpacingControlValues(resolved[tier]), attributes[key]);
    }
});

test('CSS preset variables restore named notches while custom variables stay custom', () => {
    assert.deepEqual(getSpacingControlValues({
        top: 'var(--wp--preset--spacing--small)',
        right: 'var(--wp--preset--spacing--60)',
        bottom: 'var(--wp--preset--spacing--x-large)',
        left: 'var(--custom-spacing)',
    }), {
        top: 'var:preset|spacing|small',
        right: 'var:preset|spacing|60',
        bottom: 'var:preset|spacing|x-large',
        left: 'var(--custom-spacing)',
    });
});

test('zero values use the native zero notch regardless of saved unit', () => {
    assert.deepEqual(ZERO_SPACING, allSides('0'));
    for (const zero of [0, '0', '0px', '0em', '0rem', '0%', '0.00px', '-0px', '+0px']) {
        assert.deepEqual(getSpacingControlValues(allSides(zero)), ZERO_SPACING);
    }
    const saved = reload({mobileMargin: ZERO_SPACING});
    const {resolved} = margins.getResponsiveMargins(saved);
    for (const values of Object.values(resolved)) {
        assert.deepEqual(values, allSides('0px'));
        assert.deepEqual(getSpacingControlValues(values), ZERO_SPACING);
    }
});

test('custom units and negative margins survive serialization without becoming presets', () => {
    const values = {top: '12px', right: '1.5em', bottom: '2rem', left: '-3%'};
    assert.deepEqual(getSpacingControlValues(reload(values)), values);
    assert.equal(getPaddingStr({...values, left: '3%'}), '12px 1.5em 2rem 3%');
    assert.deepEqual(getSpacingControlValues({top: 'calc(2rem + 4px)', left: 'auto'}), {
        top: 'calc(2rem + 4px)', left: 'auto',
    });
});

test('padding renders each named preset as a CSS variable in the correct side order', () => {
    assert.equal(getPaddingStr({
        top: 'var:preset|spacing|small',
        right: 'var:preset|spacing|40',
        bottom: 'var:preset|spacing|large',
        left: 'var:preset|spacing|x-large',
    }), [
        'var(--wp--preset--spacing--small)',
        'var(--wp--preset--spacing--40)',
        'var(--wp--preset--spacing--large)',
        'var(--wp--preset--spacing--x-large)',
    ].join(' '));
    assert.equal(getPaddingStr({top: 'var:preset|spacing|40', bottom: '2em'}, '3px'),
        'var(--wp--preset--spacing--40) 3px 2em 3px');
    assert.equal(getPaddingStr(20), '20px 20px 20px 20px');
});

test('blank overrides keep inheritance and clearing base keeps legacy margins cleared', () => {
    assert.deepEqual(getSpacingControlValues(undefined), {});
    assert.deepEqual(getSpacingControlValues({top: '', right: undefined, bottom: ' '}), {});
    const legacy = {style: {spacing: {margin: {top: 'var:preset|spacing|40', bottom: '2rem'}}}};
    const existing = margins.getResponsiveMargins(reload(legacy));
    assert.deepEqual(getSpacingControlValues(existing.mobile), legacy.style.spacing.margin);
    assert.deepEqual(existing.resolved.desktop, existing.mobile);
    const cleared = margins.getResponsiveMargins(reload({...legacy, mobileMargin: {}}));
    assert.deepEqual(cleared.resolved, {mobile: {}, tablet: {}, desktop: {}});
    assert.equal(cleared.cssVars['--cols-margin-top-mobile'], 'initial');
    assert.deepEqual(margins.getResponsiveMargins({}).mobile, {});
});

test('the parent inserter defaults margins to zero while preserving padding and legacy schema behavior', () => {
    const registrations = [];
    loadTypeScript('../src/blocks/columns/index.ts', {
        '@wordpress/blocks': {registerBlockType: (...args) => registrations.push(args)},
        '@wordpress/i18n': {__: (text) => text},
        '../../namespace': 'sidekick',
        './attributes': {parentAttributes},
        './edit': () => null,
        './save': () => null,
        './column': {},
        './icon': () => null,
        './spacing': spacing,
    });
    assert.equal(registrations.length, 1);
    const [name, settings] = registrations[0];
    assert.equal(name, 'sidekick/columns');
    const defaults = settings.variations.filter((variation) => variation.isDefault);
    assert.equal(defaults.length, 1);
    assert.ok(defaults[0].scope.includes('inserter'));
    assert.deepEqual(defaults[0].attributes.mobileMargin, allSides('0'));
    assert.deepEqual(settings.attributes.mobilePadding.default, allSides('20px'));
    assert.equal(Object.hasOwn(defaults[0].attributes, 'mobilePadding'), false);
    for (const name of ['mobileMargin', 'tabletMargin', 'desktopMargin']) {
        assert.equal(Object.hasOwn(settings.attributes[name], 'default'), false);
    }
    for (const name of ['tabletPadding', 'padding']) {
        assert.equal(Object.hasOwn(settings.attributes[name], 'default'), false);
    }
    const {resolved} = margins.getResponsiveMargins(reload(defaults[0].attributes));
    assert.deepEqual(resolved, {
        mobile: allSides('0px'), tablet: allSides('0px'), desktop: allSides('0px'),
    });
});
