const path = require('path');
const production = process.argv.includes('production');

module.exports = (dirname, target) => ({
  mode: production ? 'production' : 'development',
  devtool: production ? false : 'source-map',
  entry: './src/extension.ts',
  target,
  output: {
    path: path.join(dirname, 'out'),
    filename: target === 'webworker' ? 'extension.web.js' : 'extension.js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: (target === 'webworker' ? ['.web.js'] : []).concat(['.ts', '.js', '.json']),
    conditionNames: ['bundler', 'module', 'require'],
    ...(target === 'node'
      ? {}
      : {
          fallback: {
            path: require.resolve('path-browserify'),
            os: require.resolve('os-browserify/browser'),
            vm: require.resolve('vm-browserify'),
            assert: require.resolve('assert/'),
            util: require.resolve('util/'),
            "fs": false,
            "zlib": require.resolve("browserify-zlib"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "url": require.resolve("url/"),
            "net": false,
            "tls": false,
            "buffer": require.resolve("buffer/"),
            "ws": false
          },
        }),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
          compilerOptions: { declaration: false },
        },
      },
    ],
  },
  experiments: {
    syncWebAssembly: true,
  },
});
