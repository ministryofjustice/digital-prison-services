const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isDevelopment = process.env.NODE_ENV === 'development'
const isAnalyse = process.env.BUNDLE_ANALYSE !== undefined

const developmentEntries = isDevelopment
  ? [
      // Add the client which connects to our middleware
      // You can use full urls like 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr'
      // useful if you run your app from another point like django
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    ]
  : []

const plugins = [
  new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'static',
        to: 'static',
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'static/images',
        to: 'images',
      },
    ],
  }),
  new HtmlWebpackPlugin({
    template: 'html-template/index.html',
    filename: 'index.html',
  }),
]

if (isDevelopment) plugins.push(new webpack.HotModuleReplacementPlugin())
if (isAnalyse) plugins.push(new BundleAnalyzerPlugin())

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: [...developmentEntries, './src/index.js'],
  output: {
    filename: './app/bundle.js',
    path: path.join(__dirname, 'build'),
    publicPath: process.env.PUBLIC_URL || '/',
    environment: {
      // The environment supports arrow functions ('() => { ... }').
      arrowFunction: true,
      // The environment supports BigInt as literal (123n).
      bigIntLiteral: false,
      // The environment supports const and let for variable declarations.
      const: true,
      // The environment supports destructuring ('{ a, b } = obj').
      destructuring: true,
      // The environment supports an async import() function to import EcmaScript modules.
      dynamicImport: false,
      // The environment supports 'for of' iteration ('for (const x of array) { ... }').
      forOf: false,
      // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
      module: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false, // See https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
        },
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx|mjs)$/,
            loader: require.resolve('babel-loader'),
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
            },
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  url: {
                    filter: (url, resourcePath) => {
                      // Work-round for https://issueexplorer.com/issue/webpack-contrib/css-loader/1367
                      if (/^data:/.test(url)) {
                        return false
                      }
                      return true
                    },
                  },
                },
              },
            ],
          },
          {
            test: /\.scss$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  url: {
                    filter: (url, resourcePath) => {
                      if (
                        url.includes('icon-steps') ||
                        url.startsWith('icon-') ||
                        url === 'separator.png' ||
                        url.startsWith('separator-')
                      ) {
                        return false
                      }
                      // Work-round for https://issueexplorer.com/issue/webpack-contrib/css-loader/1367
                      if (/^data:/.test(url)) {
                        return false
                      }

                      return true
                    },
                  },
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: {
                    includePaths: [
                      'node_modules/govuk_frontend_toolkit/stylesheets',
                      'node_modules/govuk-elements-sass/public/sass',
                      'node_modules/govuk-frontend/dist',
                      'node_modules/govuk-frontend/dist/govuk/assets',
                    ],
                  },
                },
              },
            ],
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },
  plugins,
  resolve: {
    alias: {
      path: false,
      common: path.resolve(__dirname, 'common/'),
    },
    fallback: {
      os: false,
      zlib: false,
      tty: false,
    },
  },
}
