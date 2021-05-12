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
        test: /\.(js|jsx)$/u,
        exclude: /node_modules/u,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-class-properties',
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
