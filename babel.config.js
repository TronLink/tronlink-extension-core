module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        loose: true,
      },
    ],
    '@babel/preset-typescript',
  ];

  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: {
          version: 3,
          proposals: true,
        },
        version: '^7.16.0',
      },
    ],
    '@babel/plugin-transform-optional-chaining',
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-classes', { loose: true }],
    ['@babel/plugin-transform-template-literals', { loose: true }],
  ];

  return { presets, plugins };
};
