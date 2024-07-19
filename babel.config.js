module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    'babel-plugin-add-module-exports'
  ],
  env: {
    esm: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: '18'
          },
          modules: false
        }]
      ]
    },
    cjs: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: '18'
          }
        }]
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        'babel-plugin-add-module-exports'
      ]
    }
  }
};

