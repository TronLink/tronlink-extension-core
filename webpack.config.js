const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const mode = process.env.NODE_ENV || 'production';

const baseConfig = {
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
    port: 9050,
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    fallback: {
      'querystring-es3': require.resolve('querystring-es3'),
      events: require.resolve('events/'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      zlib: require.resolve('browserify-zlib'),
      util: require.resolve('util'),
      url: require.resolve('url'),
      assert: require.resolve('assert'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
  externals: [nodeExternals()],
  devtool: 'source-map',
  mode,
};

module.exports = [
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: 'TronLinkExtensionCore',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: 'this',
    },
  },
];
