const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TaskWrapperPlugin = require('./TaskWrapperPlugin');

// All of the individual scripts to be built need to be listed here
const actions = [
  'get_user',
  'login',
  'change_password',
  'change_email',
  'verify',
  'create',
  'delete',
];

// Any non-node external modules should be listed here
// They must be on this list: https://auth0-extensions.github.io/canirequire/
const externalModules = ['axios'];

const configFile = 'tsconfig.build.json';

module.exports = {
  mode: 'production',
  entry: actions.reduce(
    (entrypoints, action) => ({
      [action]: `./src/${action}.ts`,
      ...entrypoints,
    }),
    {}
  ),
  externals: externalModules.reduce(
    (modules, external) => ({
      ...modules,
      [external]: {
        commonjs: external,
      },
    }),
    {}
  ),
  externalsType: 'commonjs',
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            projectReferences: true,
            configFile,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile })],
  },
  plugins: [new TaskWrapperPlugin()],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    // This config means that the output declares a `var` named as the chunk name
    // to which the default export of the script is assigned, with the suffix `_script`
    // in case the chunk name is not a valid identifier.
    library: {
      name: '[name]_script',
      type: 'var',
      export: 'default',
    },
  },
  target: 'node',
  node: false, // Never polyfill node internals
};
