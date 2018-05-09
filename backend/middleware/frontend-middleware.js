/* eslint-disable global-require */
const express = require('express');
const path = require('path');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const config = require('../config');

// Dev middleware
const addDevMiddlewares = (app, options, webpackConfig) => {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);

  const middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    silent: true,
    stats: 'errors-only',
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  if (pkg.dllPlugin) {
    app.get(/\.dll\.js$/, (req, res) => {
      const filename = req.path.replace(/^\//, '');
      res.sendFile(path.join(process.cwd(), pkg.dllPlugin.path, filename));
    });
  }

  app.get('*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });
};

// Production middlewares
const addProdMiddlewares = (app, options) => {
  const publicPath = options.publicPath || '/';
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'build');
  app.use(publicPath, express.static(outputPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(outputPath, 'index.html'));
  });
};

/**
 * Front-end middleware
 */
module.exports = (app, options) => {
  if (config.app.production) {
    addProdMiddlewares(app, options);
  } else {
    const webpackConfig = require('../../config/webpack.config.dev');
    addDevMiddlewares(app, options, webpackConfig);
  }

  return app;
};
