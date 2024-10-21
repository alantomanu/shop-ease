const path = require('path');

module.exports = {
  entry: './public/js/main.js', // Change this to your front-end entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public', 'build'), // Output the bundle in the public folder
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
