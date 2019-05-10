const webpack = require('webpack');
const path = require('path');

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'docs');

module.exports = () => ({
    entry: ['@babel/polyfill', `${src}/index.js`],

    output: {
        path: dist,
        filename: 'bundle.js',
    },
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules(?!(\/|\\)keen-ui)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env', { modules: false }]]
                        }
                    }
                ]
            }]},

    devtool: (process.env.NODE_ENV === 'production') ? false : 'inline-source-map',

    resolve: {
        extensions: ['.js'],
    },

    devServer: {
        contentBase: 'docs',
        port: 3000,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
});
