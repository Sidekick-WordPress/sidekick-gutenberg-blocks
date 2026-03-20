const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WordPressDependencyExtractionPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const DIST_DIR = path.resolve(__dirname, '../build');

module.exports = {
    entry: {
        blocks: './src/blocks.ts',
        react: './src/react.ts',
        'blocks-edit': './src/styles/blocks-edit.scss',
        'blocks-save': './src/styles/blocks-save.scss',
    },

    output: {
        path: DIST_DIR,
        filename: 'js/[name].min.js',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        fallback: {
            util: require.resolve('util/'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
        },
    },

    module: {
        rules: [
            {
                test: /\.(js|ts)x?$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' },
            },
            {
                test: /\.(woff2?|ttf|eot)$/i,
                type: 'asset/resource',
                generator: { filename: 'fonts/[name][ext]' },
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: { filename: 'images/[name][ext]' },
            },
        ],
    },

    plugins: [
        new ProgressBarPlugin(),
        new CleanWebpackPlugin(),
        new WordPressDependencyExtractionPlugin(),
    ],
};
