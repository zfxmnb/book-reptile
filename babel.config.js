module.exports = function config(api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: { node: 'current' }, // node
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: true }
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ];

  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-transform-modules-commonjs'] // node
  ];

  return {
    presets,
    plugins
  };
};
