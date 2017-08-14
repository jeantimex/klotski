var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/demo.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
