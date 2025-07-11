const path = require('path');
const webpack = require('webpack');

console.log('Starting webpack build...');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/lambda.ts',
  externals: [
    'aws-sdk'
  ],
  plugins: [
    new webpack.IgnorePlugin({
      contextRegExp: /^@nestjs\/(?!common|core|platform-express)/,
      resourceRegExp: /.*/
    }),
    new webpack.IgnorePlugin({

      resourceRegExp: /^@nestjs\/websockets/
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^@nestjs\/microservices/
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^class-transformer\/storage$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'src': path.resolve(__dirname, 'src')
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  optimization: {
    minimize: true
  }
};
