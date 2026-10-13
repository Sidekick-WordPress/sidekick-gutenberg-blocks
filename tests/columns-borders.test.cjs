const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

const {getResponsiveBorders} = require('../src/blocks/columns/borders.ts');
const sides = ['top', 'right', 'bottom', 'left'];
const tiers = ['mobile', 'tablet', 'desktop'];
const allSides = value => Object.fromEntries(sides.map(side => [side, {...value}]));
const defaults = {width: '0px', style: 'solid', color: 'currentColor'};
const flat = {border: {width: 2, style: 'dashed', color: '#123456'}};
const split = {border: {
    top: {width: 1, style: 'solid', color: '#111111'},
    right: {width: '2px', style: 'dashed', color: '#222222'},
    bottom: {width: '0.25rem', style: 'dotted', color: '#333333'},
    left: {width: '4', style: 'double', color: '#444444'},
}};
const cascade = {
    border: {width: 2, style: 'solid', color: 'red', top: {width: 4}},
    tabletBorder: {color: 'blue', top: {style: 'dashed'}, right: {width: 0}},
    desktopBorder: {width: 1, bottom: {color: 'green'}},
};

test('a flat border applies to all sides and inherits at larger breakpoints', () => {
    const {resolved} = getResponsiveBorders(flat);
    const expected = allSides({width: '2px', style: 'dashed', color: '#123456'});
    assert.deepEqual(resolved, {mobile: expected, tablet: expected, desktop: expected});
});

test('four distinct sides retain their own widths, styles, and colors after reload', () => {
    const attributes = JSON.parse(JSON.stringify(split));
    const {resolved} = getResponsiveBorders(attributes);
    const expected = {
        top: {width: '1px', style: 'solid', color: '#111111'},
        right: {width: '2px', style: 'dashed', color: '#222222'},
        bottom: {width: '0.25rem', style: 'dotted', color: '#333333'},
        left: {width: '4px', style: 'double', color: '#444444'},
    };
    assert.deepEqual(resolved, {mobile: expected, tablet: expected, desktop: expected});
    assert.deepEqual(attributes, split);
});

test('partial overrides inherit each property while a higher-tier flat width replaces lower split widths', () => {
    const {resolved} = getResponsiveBorders(cascade);
    assert.deepEqual(resolved.mobile, {
        ...allSides({width: '2px', style: 'solid', color: 'red'}),
        top: {width: '4px', style: 'solid', color: 'red'},
    });
    assert.deepEqual(resolved.tablet, {
        top: {width: '4px', style: 'dashed', color: 'blue'},
        right: {width: '0px', style: 'solid', color: 'blue'},
        bottom: {width: '2px', style: 'solid', color: 'blue'},
        left: {width: '2px', style: 'solid', color: 'blue'},
    });
    assert.deepEqual(resolved.desktop, {
        top: {width: '1px', style: 'dashed', color: 'blue'},
        right: {width: '1px', style: 'solid', color: 'blue'},
        bottom: {width: '1px', style: 'solid', color: 'green'},
        left: {width: '1px', style: 'solid', color: 'blue'},
    });
});

test('same-tier side properties override flat properties without discarding unspecified values', () => {
    const {resolved} = getResponsiveBorders({border: {
        width: '3px', style: 'dotted', color: 'black',
        top: {width: '6px'}, right: {style: 'double'}, bottom: {color: 'red'},
    }});
    assert.deepEqual(resolved.mobile, {
        top: {width: '6px', style: 'dotted', color: 'black'},
        right: {width: '3px', style: 'double', color: 'black'},
        bottom: {width: '3px', style: 'dotted', color: 'red'},
        left: {width: '3px', style: 'dotted', color: 'black'},
    });
});

test('numeric zero, string zero, and none explicitly remove inherited borders', () => {
    for (const zero of [0, '0', '0px']) {
        const {resolved} = getResponsiveBorders({
            border: {width: '5px', style: 'solid', color: 'red'},
            tabletBorder: {width: zero},
        });
        assert.deepEqual(resolved.tablet, allSides({width: '0px', style: 'solid', color: 'red'}));
        assert.deepEqual(resolved.desktop, resolved.tablet);
    }
    const {resolved} = getResponsiveBorders({
        border: {width: '5px', style: 'dashed', color: 'red'},
        tabletBorder: {style: 'none'}, desktopBorder: {top: {style: 'solid'}},
    });
    assert.deepEqual(resolved.tablet, allSides({width: '5px', style: 'none', color: 'red'}));
    assert.deepEqual(resolved.desktop.top, {width: '5px', style: 'solid', color: 'red'});
    assert.equal(resolved.desktop.bottom.style, 'none');
});

test('resetting a tier with empty object, empty array, or undefined restores inheritance', () => {
    for (const reset of [{}, [], undefined]) {
        const {resolved} = getResponsiveBorders({...flat, tabletBorder: reset, desktopBorder: reset});
        assert.deepEqual(resolved.tablet, resolved.mobile);
        assert.deepEqual(resolved.desktop, resolved.mobile);
        const baseReset = getResponsiveBorders({border: reset});
        for (const tier of tiers) assert.deepEqual(baseReset.resolved[tier], allSides(defaults));
    }
    const clearedProperty = getResponsiveBorders({
        ...flat, tabletBorder: {width: '', top: {color: null}, bottom: {style: undefined}},
    });
    assert.deepEqual(clearedProperty.resolved.tablet, clearedProperty.resolved.mobile);
});

test('nested containers define all 36 border variables locally and do not inherit an outer border', () => {
    const parent = getResponsiveBorders({
        border: {width: '8px', style: 'double', color: 'purple'},
        tabletBorder: {width: '12px'}, desktopBorder: {color: 'orange'},
    });
    const child = getResponsiveBorders({});
    assert.equal(Object.keys(child.cssVars).length, 36);
    // CSS custom properties inherit, so every child's key must replace its parent's.
    const nestedVariables = {...parent.cssVars, ...child.cssVars};
    assert.deepEqual(nestedVariables, child.cssVars);
    for (const tier of tiers) {
        for (const side of sides) {
            assert.equal(child.cssVars[`--cols-border-${side}-width-${tier}`], '0px');
            assert.equal(child.cssVars[`--cols-border-${side}-style-${tier}`], 'solid');
            assert.equal(child.cssVars[`--cols-border-${side}-color-${tier}`], 'currentColor');
        }
    }
});

test('theme color presets become CSS variables while custom colors remain unchanged', () => {
    const {resolved} = getResponsiveBorders({
        border: {width: '1px', color: 'var:preset|color|primary-dark'},
        tabletBorder: {right: {color: 'var(--custom-border-color)'}},
        desktopBorder: {bottom: {color: 'rgb(20 30 40 / 50%)'}},
    });
    assert.equal(resolved.mobile.top.color, 'var(--wp--preset--color--primary-dark)');
    assert.equal(resolved.tablet.right.color, 'var(--custom-border-color)');
    assert.equal(resolved.desktop.right.color, 'var(--custom-border-color)');
    assert.equal(resolved.desktop.bottom.color, 'rgb(20 30 40 / 50%)');
});

test('invalid overrides cannot replace valid inherited border values', () => {
    const {resolved} = getResponsiveBorders({
        ...flat,
        tabletBorder: {width: -1, style: 'invalid', color: 'red;position:absolute'},
        desktopBorder: {top: {width: '-2px'}, right: {width: Infinity}, bottom: {color: 'red/*comment*/'}},
    });
    assert.deepEqual(resolved.tablet, resolved.mobile);
    assert.deepEqual(resolved.desktop, resolved.mobile);
});

test('PHP and editor resolve border inheritance and CSS variables identically', {
    skip: process.env.PHP_BINARY ? false : 'Set PHP_BINARY to run PHP rendering checks',
}, () => {
    const cases = [
        {}, flat, split, cascade,
        {...flat, tabletBorder: {width: 0}, desktopBorder: {style: 'none'}},
        {...flat, tabletBorder: {width: '0'}},
        {...flat, tabletBorder: {}, desktopBorder: []},
        {...flat, tabletBorder: {top: {width: '0', color: 'var:preset|color|primary-dark'}}},
        {...flat, tabletBorder: {width: '', color: null, style: undefined}},
        {...flat, tabletBorder: {width: -1, style: 'invalid', color: 'red;position:absolute'}},
    ];
    const php = [
        "define('ABSPATH', __DIR__);",
        'require $argv[1];',
        '$inputs = json_decode($argv[2], true);',
        "echo json_encode(array_map('sgb_get_columns_borders', $inputs));",
    ].join('\n');
    const result = spawnSync(process.env.PHP_BINARY, [
        '-r', php, path.resolve(__dirname, '../src/blocks/columns/borders.php'), JSON.stringify(cases),
    ], {encoding: 'utf8'});
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    const expected = cases.map(attributes => {
        const {resolved, cssVars} = getResponsiveBorders(attributes);
        return {resolved, css_vars: cssVars};
    });
    assert.deepEqual(JSON.parse(result.stdout), expected);
});
