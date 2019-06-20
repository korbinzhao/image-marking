const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  entry: {
    demo: './demo/index.js',
    index: './src/index.js',
  },
  module: {
    rules: [{
      test: /\.js$|\.jsx$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /\.js[x]?$/,
      enforce: 'pre',
      use: [{
        loader: 'eslint-loader',
        options: {
          fix: true,
        },
      }],
      exclude: /node_modules/,
    },
    {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true,
        },
      }],
    },
    {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
    },
    {
      test: /\.less$/,
      exclude: '/node_modules',
      use: [{
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: loader => [
            require('postcss-import')({
              root: loader.resourcePath,
            }),
            require('postcss-cssnext')(),
            require('autoprefixer')(),
            require('cssnano')(),
          ],
        },
      },
      {
        loader: 'less-loader',
        options: {
          importLoaders: 1,
        },
      },

      ],
    },
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loader: 'file-loader',
    },
      // {
      //   test: require.resolve('snapsvg'),
      //   loader: 'imports-loader?this=>window,fix=>module.exports=0'
      // },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './demo/index.html',
      filename: './index.html',
      chunks: ['demo'],
    }),
  ],
};
