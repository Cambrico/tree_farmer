const path = require('path');
const glob = require('glob');
const isDev = (process.env.NODE_ENV !== 'production');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const autoprefixer = require('autoprefixer');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const postcssRTLCSS = require('postcss-rtlcss');

module.exports = {
  entry: {
    // ################################################
    // CSS
    // ################################################
    // Base
    'base/nfa_gin_farmers': ['./styles/nfa_gin_farmers.scss'],
    // Libraries
    ...glob.sync('./styles/libraries/*.scss').reduce((entries, file) => {
      const name = path.basename(file, '.scss');
      entries[`libraries/${name}`] = file;
      return entries;
    }, {}),
  },
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/async/[name].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    pathinfo: true,
    publicPath: '../../',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        exclude: /sprite\.svg$/,
        type: 'javascript/auto',
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]', //?[contenthash]
            publicPath: (url, resourcePath, context) => {
              const relativePath = path.relative(context, resourcePath);

              // Settings
              if (resourcePath.includes('media/settings')) {
                return `../../${relativePath}`;
              }

              return `../${relativePath}`;
            },
          },
        },
          {
            loader: 'img-loader',
            options: {
              enabled: !isDev,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              name: '[name].[ext]?[hash]',
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              importLoaders: 2,
              url: (url) => {
                // Don't handle sprite svg
                if (url.includes('sprite.svg')) {
                  return false;
                }

                return true;
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              postcssOptions: {
                plugins: [
                  autoprefixer(),
                  postcssRTLCSS(),
                  ['postcss-perfectionist', {
                    format: 'expanded',
                    indentSize: 2,
                    trimLeadingZero: true,
                    zeroLengthNoUnit: false,
                    maxAtRuleLength: false,
                    maxSelectorLength: false,
                    maxValueLength: false,
                  }]
                ],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
              // Global SCSS imports:
              additionalData: `
                @use "sass:color";
                @use "sass:math";
                @import "../../contrib/gin/styles/helpers/_mq.scss";
                @import "../../contrib/gin/styles/helpers/_vars.scss";
                @import "../../contrib/gin/styles/helpers/_tools.scss";
              `,
            },
          },
        ],
      },
      {
        test: /\.(woff(2))(\?v=\d+\.\d+\.\d+)?$/,
        type: 'javascript/auto',
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]?[hash]',
            publicPath: (url, resourcePath, context) => {
              const relativePath = path.relative(context, resourcePath);

              // Settings
              if (resourcePath.includes('media/font')) {
                return `../../${relativePath}`;
              }

              return `../${relativePath}`;
            },
          }
        }],
      },
    ],
  },
  resolve: {
    alias: {
      media: path.join(__dirname, 'media'),
      settings: path.join(__dirname, 'media/settings'),
      font: path.join(__dirname, 'media/font'),
    },
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.json'],
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new SVGSpritemapPlugin(path.resolve(__dirname, 'media/icons/**/*.svg'), {
      output: {
        filename: 'media/sprite.svg',
        svg: {
          sizes: false
        },
        svgo: {
          plugins: [
            {
              name: 'removeAttrs',
              params: {
                attrs: '(use|symbol|svg):fill'
              }
            }
          ],
        },
      },
      sprite: {
        prefix: false,
        gutter: 0,
        generate: {
          title: false,
          symbol: true,
          use: true,
          view: '-view'
        }
      },
      styles: {
        filename: path.resolve(__dirname, 'styles/helpers/_svg-sprite.scss'),
        keepAttributes: true,
        // Fragment now works with Firefox 84+ and 91esr+
        format: 'fragment',
      }
    }),
  ],
  watchOptions: {
    aggregateTimeout: 300,
    ignored: ['**/*.woff', '**/*.json', '**/*.woff2', '**/*.jpg', '**/*.png', '**/*.svg', 'node_modules'],
  }
};
