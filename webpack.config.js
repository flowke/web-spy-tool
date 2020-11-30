
const path = require('path');

module.exports = (env, argv) => {
  const config = {
    entry: './chii/target/target.js',
    devtool: 'inline-source-map',
    output: {
      filename: 'target.js',
      path: path.resolve(__dirname, 'chii/public'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
      ],
    },
  };

  if (argv.mode === 'production') {
    config.devtool = 'source-map';
  }

  return config;
};