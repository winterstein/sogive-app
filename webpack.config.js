/*
	NB The webpack.config.js files in my-loop, adserver and wwappbase.js are identical but cannot be symlinked!
	If it's a symlink, NPM will resolve paths (including module names) relative to the symlink source - and
	complain that it can't find webpack, because it's not installed in /wwappbase.js/templates/node_modules
	Keep this copy in sync with the others - if the same file can't be used for all three, there should be a good reason.
 */
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webDir = process.env.OUTPUT_WEB_DIR || 'web';

const baseConfig = {
	entry: ['@babel/polyfill', './src/js/app.jsx'],
	output: {
		path: path.resolve(__dirname, './' + webDir + '/build/'), // NB: this should include js and css outputs
		// filename: is left undefined and filled in by makeConfig
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		symlinks: false
	},
	module: {
		rules: [
			{	// Typescript
				test: /\.tsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [
						['@babel/preset-typescript', { targets: { ie: "11" }, loose: true }],
						'@babel/react'
					],
					plugins: [
						'@babel/plugin-transform-typescript',
						'@babel/plugin-proposal-object-rest-spread',
						'babel-plugin-const-enum'
					]
				}
			},
			{	// .js or .jsx
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [
						['@babel/preset-env', { targets: { ie: "11" }, loose: true }]
					],
					plugins: [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-transform-react-jsx',
					]
				}
			}, {
				test: /\.less$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
			}
		],
	},
	plugins: [new MiniCssExtractPlugin({ filename: 'style/main.css' })]
};


/*
* Copy and fill out the baseConfig object with
* @param filename {!String} Set the bundle output.filename
* 
* ## process.env 
* process is always globally available to runtime code.
*/
const makeConfig = ({ filename, mode }) => {
	// config.mode can be "development" or "production" & dictates whether JS is minified
	const config = Object.assign({}, baseConfig, { mode });
	
	// What filename should we render to?
	config.output = Object.assign({}, config.output, { filename });

	// The "mode" param should be inserting process.env already...
	// process.env is available globally within bundle.js & allows us to hardcode different behaviour for dev & production builds	
	return config;
};

const configs = [
	makeConfig({filename: 'js/bundle-debug.js', mode: 'development' }),
];
// Allow debug-only compilation for faster iteration in dev
if (process.env.NO_PROD !== 'true') {
	configs.push(makeConfig({filename: 'js/bundle.js', mode: 'production' }));
}

// Output bundle files for production and dev/debug
module.exports = configs;
