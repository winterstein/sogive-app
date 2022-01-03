const nodeExternals = require('webpack-node-externals');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    entry: path.resolve(__dirname, '.', 'src/server/index.js'),
    output: {
        path: path.resolve(__dirname, '.', 'web/build/js'),
        publicPath: '/js/',
        filename: 'server.js',
        library: 'app',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            components: path.resolve(__dirname, '.', 'src/js/')
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                }
            },
            {
							test: /\.less$/,
							use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
						}
        ]
    }
};