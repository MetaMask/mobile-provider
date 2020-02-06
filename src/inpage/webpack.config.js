// Webpack uses this to work with directories
const path = require('path')

// This is main configuration object.
// Here you write different options and tell Webpack what to do
const config = {

  // Path to your entry point. From this file Webpack will begin his work
  entry: './index.js',

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, '..', '..', 'dist'),
    filename: 'inpage.js',
  },

  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on final bundle. For now we don't need production's JavaScript
  // minifying and other thing so let's set mode to development
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
}

module.exports = (_env, argv) => {

  if (argv.mode === 'development') {
    config.mode = 'development'
  }

  return config
}
