const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const {transformFileSync} = require('@babel/core');

const filename = path.resolve(__dirname, '../src/blocks/columns/margins.ts');
const compiled = transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
});
const marginModule = new Module(filename, module);
marginModule.filename = filename;
marginModule.paths = Module._nodeModulePaths(path.dirname(filename));
marginModule._compile(compiled.code, filename);
const {normalizeMargin, getResponsiveMargins} = marginModule.exports;

const reload = (attributes) => JSON.parse(JSON.stringify(attributes));

test('saved core margins preserve top and bottom zeroes and spacing presets at every breakpoint', () => {
    const attributes = {style: {spacing: {margin: {top: 0, bottom: 'var:preset|spacing|50'}}}};
    const result = getResponsiveMargins(reload(attributes));
    const expected = {top: '0px', bottom: 'var(--wp--preset--spacing--50)'};
    assert.deepEqual(result.mobile, expected);
    assert.deepEqual(result.resolved, {mobile: expected, tablet: expected, desktop: expected});
    assert.equal(result.cssVars['--cols-margin-top-mobile'], '0px');
    assert.equal(result.cssVars['--cols-margin-bottom-mobile'], 'var(--wp--preset--spacing--50)');
    assert.deepEqual(attributes.style.spacing.margin, {top: 0, bottom: 'var:preset|spacing|50'});
});

test('editing base margins replaces legacy sides and stays edited after a save and reload', () => {
    const attributes = {
        style: {spacing: {margin: {top: '9rem', bottom: '8rem'}}},
        mobileMargin: {top: '1rem'},
    };
    const result = getResponsiveMargins(reload(attributes));
    assert.deepEqual(result.mobile, {top: '1rem'});
    assert.deepEqual(result.resolved.desktop, {top: '1rem'});
    assert.equal(result.cssVars['--cols-margin-bottom-mobile'], 'initial');
});

test('resetting base margins to an empty object does not revive saved core margins', () => {
    const attributes = {
        style: {spacing: {margin: {top: '0', bottom: 'var:preset|spacing|40'}}},
        mobileMargin: {},
    };
    const result = getResponsiveMargins(reload(attributes));
    assert.deepEqual(result.resolved, {mobile: {}, tablet: {}, desktop: {}});
    assert.equal(result.cssVars['--cols-margin-top-mobile'], 'initial');
    assert.equal(result.cssVars['--cols-margin-bottom-mobile'], 'initial');
});

test('blank tablet and desktop sides inherit while explicit zero overrides inherited spacing', () => {
    const result = getResponsiveMargins(reload({
        mobileMargin: {top: '1rem', right: '2rem', bottom: '3rem', left: '4rem'},
        tabletMargin: {top: '', right: '0', bottom: '5rem', left: undefined},
        desktopMargin: {top: '0px', right: ' ', bottom: undefined, left: '-1rem'},
    }));
    assert.deepEqual(result.tablet, {right: '0px', bottom: '5rem'});
    assert.deepEqual(result.desktop, {top: '0px', left: '-1rem'});
    assert.deepEqual(result.resolved.tablet, {top: '1rem', right: '0px', bottom: '5rem', left: '4rem'});
    assert.deepEqual(result.resolved.desktop, {top: '0px', right: '0px', bottom: '5rem', left: '-1rem'});
    assert.equal(result.cssVars['--cols-margin-top-tablet'], 'initial');
    assert.equal(result.cssVars['--cols-margin-right-tablet'], '0px');
    assert.equal(result.cssVars['--cols-margin-right-desktop'], 'initial');
});

test('new blocks preserve theme spacing and locally reset raw variables for nested columns', () => {
    const result = getResponsiveMargins({});
    assert.deepEqual(result.resolved, {mobile: {}, tablet: {}, desktop: {}});
    assert.deepEqual(result.cssVars, {
        '--cols-margin-top-mobile': 'initial',
        '--cols-margin-right-mobile': 'initial',
        '--cols-margin-bottom-mobile': 'initial',
        '--cols-margin-left-mobile': 'initial',
        '--cols-margin-top-tablet': 'initial',
        '--cols-margin-right-tablet': 'initial',
        '--cols-margin-bottom-tablet': 'initial',
        '--cols-margin-left-tablet': 'initial',
        '--cols-margin-top-desktop': 'initial',
        '--cols-margin-right-desktop': 'initial',
        '--cols-margin-bottom-desktop': 'initial',
        '--cols-margin-left-desktop': 'initial',
    });
});

test('legacy shorthand uses CSS side order and preserves negative values and functions', () => {
    assert.deepEqual(normalizeMargin('-2rem'), {
        top: '-2rem', right: '-2rem', bottom: '-2rem', left: '-2rem',
    });
    assert.deepEqual(normalizeMargin('0 auto'), {
        top: '0px', right: 'auto', bottom: '0px', left: 'auto',
    });
    assert.deepEqual(normalizeMargin('1px 2px -3px'), {
        top: '1px', right: '2px', bottom: '-3px', left: '2px',
    });
    assert.deepEqual(normalizeMargin('calc(1rem - 2px) var(--custom-space, 3px) -4px 5%'), {
        top: 'calc(1rem - 2px)', right: 'var(--custom-space, 3px)', bottom: '-4px', left: '5%',
    });
    assert.deepEqual(normalizeMargin({top: -12, bottom: 0}), {top: '-12px', bottom: '0px'});
});

test('unsafe CSS is discarded without losing valid neighboring sides', () => {
    for (const unsafe of [
        '0; color: red', '0} body {color: red}', '<style>', '0/*comment*/',
        '0\\3b color:red', '0\u0000', '0\u007f', Infinity, NaN,
    ]) {
        assert.deepEqual(normalizeMargin({top: unsafe, bottom: '2rem'}), {bottom: '2rem'});
    }
    for (const invalidShorthand of ['calc(1rem - 2px', '1px) 2px', '1px 2px 3px 4px 5px']) {
        assert.deepEqual(normalizeMargin(invalidShorthand), {});
    }
});
