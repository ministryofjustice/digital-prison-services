const presets = ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react']

const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-throw-expressions',
  ['@babel/plugin-proposal-private-methods', { loose: true }],
  ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
]

const ignore = ['.spec.js', '.test.js', '.spec.ts', '.test.ts', '-test.js', '/__tests__/']

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV)
  return {
    presets,
    plugins,
    ignore,
  }
}
