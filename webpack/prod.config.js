const { merge } = require('webpack-merge');
const baseConfig = require('./base.config.js');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const path = require('path');

function getNamespace() {
    // Load the JSON directly; avoid importing app code here
    return require(path.resolve(__dirname, '../namespace.json')).ns;
}
const NAMESPACE = getNamespace();

const envUse =
    '@use "./defaults/namespace" as ns with ($namespace: "' + NAMESPACE + '");\n';

module.exports = merge(baseConfig, {
    mode: 'production',
    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.s?css$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { sourceMap: true } },
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: envUse,
                            implementation: require('sass-embedded'),
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new RemoveEmptyScriptsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ extractComments: () => false })],
    },
});
