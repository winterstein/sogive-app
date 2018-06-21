var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: [
		"babel-polyfill", './src/js/app.jsx'
	],
  output: { path: __dirname, filename: './web/build/js/bundle.js' },
  devtool: 'source-map',
  resolve: {
    extensions: ['*', '.js', '.jsx'],
	symlinks: false
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
          plugins: ["transform-object-rest-spread"]
        }
      }
    ]
  },
};
