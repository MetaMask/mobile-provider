const path = require('path');

const config = {
  entry: './index.js',

  output: {
    path: path.resolve(__dirname, '..', '..', 'dist'),
    filename: 'inpage-content.js',
  },

  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/u,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-nullish-coalescing-operator',
            ],
          },
        },
      },
    ],
  },
};

module.exports = (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
