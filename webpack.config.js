const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

class CopyAppCssPlugin {
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const css = fs.readFileSync(path.resolve(__dirname, 'src/app.css'));
      compilation.assets['app.css'] = {
        source: () => css,
        size: () => css.length,
      };
      callback();
    });
  }
}

module.exports = {
  entry: {
    app: './src/word-art.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyAppCssPlugin(),
    new HtmlWebpackPlugin({
      title: 'Word Art Generator',
      template: './src/index.html',
    }),
    new UglifyJSPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
};
