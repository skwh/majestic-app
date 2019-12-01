const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const strToBool = (str) => {
  if (str === 'true')
    return true;
  return false;
}

module.exports = env => {
  if (env !== undefined && env.production) {
    env.production = strToBool(env.production);
  } else {
    env = { production: true }
  }
  console.log(env);
  return {
    mode: env.production ?
          'production' : 'development',
    entry: {
      view: './src/view/main.js'
    },
    devtool: 'cheap-module-eval-source-map',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/')
      },
      extensions: ['.js', '.vue']
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          exclude: '/node_modules/',
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.join(__dirname, 'node_modules/.cache/vue-loader')
              }
            },
            {
              loader: 'vue-loader',
              options: {
                compilerOptions: {
                  preserveWhitespace: false
                },
                cacheDirectory: path.join(__dirname, 'node_modules/.cache/vue-loader')
              }
            }
          ]
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [
            path.join(__dirname, 'src/view')
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: 'vue-style-loader',
              options: {
                sourceMap: false,
                shadowMode: false
              }
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: false,
                importLoaders: 2
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader',
          ],
        },
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(env.production),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.ProgressPlugin(),
      new VueLoaderPlugin(),
      new MomentLocalesPlugin(),
      new HtmlWebpackPlugin({
        title: 'majestic-app',
        filename: 'index.html',
        template: './src/public/index.html',
        inject: true
      }),
      new CleanWebpackPlugin()
    ],
    devServer: {
      hot: false,
      compress: true,
      overlay: { warnings: false, errors: true },
    },
    node: {
      setImmediate: false,
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    },
    optimization: {
      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    output: {
      filename: '[name].[hash].js',
      path: path.join(__dirname, 'dist/view'),
      publicPath: '/',
    }
  };
}