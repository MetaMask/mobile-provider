// Webpack uses this to work with directories
// eslint-disable-next-line import/no-commonjs
const path = require('path');

// This is main configuration object.
// Here you write different options and tell Webpack what to do
// eslint-disable-next-line import/no-commonjs
module.exports = {

  // Path to your entry point. From this file Webpack will begin his work
  entry: './src/index.js',

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    // eslint-disable-next-line no-undef
    path: path.resolve(__dirname, './dist/'),
    filename: 'index.js'
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
					plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-proposal-class-properties']
				}
			}
		}
    ]
  },

};
