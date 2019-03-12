const presets = ['@babel/preset-env', '@babel/preset-react']

const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-throw-expressions',
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
