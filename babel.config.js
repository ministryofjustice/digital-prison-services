const presets = ['@babel/preset-env', '@babel/preset-react']

const plugins = [
  '@babel/plugin-proposal-class-properties',
  // '@babel/plugin-transform-regenerator',
  // '@babel/plugin-syntax-dynamic-import',
  // '@babel/plugin-syntax-import-meta',
  // '@babel/plugin-proposal-json-strings',
  // [
  //   '@babel/plugin-proposal-decorators',
  //   {
  //     legacy: true,
  //   },
  // ],
  // '@babel/plugin-proposal-function-sent',
  // '@babel/plugin-proposal-export-namespace-from',
  // '@babel/plugin-proposal-numeric-separator',
  // '@babel/plugin-proposal-throw-expressions',
]

const ignore = ['.spec.js', '.test.js', '-test.js', '/__tests__/']

module.exports = api => {
  api.cache(() => process.env.NODE_ENV)
  return {
    presets,
    plugins,
    ignore,
  }
}
