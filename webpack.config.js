const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = env => {
  return {
    mode: env.production ?
          'production' : 'development',
    entry: './src/view/main.js',
    devtool: env.production ?
          'source-map' : 'cheamp-module-eval-source-map',
    module: {
      rules: [
        {
          test: /\.vue$/,
          exclude: '/node_modules/',
          loader: 'vue-loader'
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        title: 'majestic-app',
        filename: 'index.html',
        template: './src/public/index.html',
        inject: true
      }),
      new CleanWebpackPlugin()
    ],
    devServer: {
      contentBase: './dist',
      hot: true,
      compress: true,
      overlay: { warnings: true, errors: true },

    },
    node: {
      setImmediate: false,
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist/view')
    }
  };
}