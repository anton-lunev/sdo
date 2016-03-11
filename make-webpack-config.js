var
    webpack = require('webpack'),
    p = require('path'),

    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    autoprefixer = require('autoprefixer-core'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),

    VENDOR_DIR = p.join(__dirname, 'static/vendor'),
    LIBS_DIR = p.join(__dirname, 'static/libs'),

    BABEL_OPTIONS = {
        optional: 'runtime'
    };

module.exports = function (options) {
    options = options || {};

    var
        config = {
            name: 'APP_NAME',
            entry: {
                common: 'static/src/common.js',
                index: 'static/src/app.js'
            },
            output: {
                path: p.join(__dirname, 'static', 'public', 'assets', 'compiled'),
                filename: '[name].js',
                chunkFilename: '[chunkName].js',
                publicPath: '/assets/compiled/',
                pathinfo: !!options.pathinfo,
                hash: false
            },
            resolve: {
                root: [
                    __dirname,
                    VENDOR_DIR,
                    LIBS_DIR
                ]
            },
            module: {
                loaders: [
                    {
                        test: /\.js/,
                        loader: 'babel-loader',
                        query: BABEL_OPTIONS,
                        exclude: [/node_modules/, VENDOR_DIR, LIBS_DIR]
                    },
                    {
                        test: /\.(less|css)/,
                        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader?sourceMap!less-loader?sourceMap')
                    },
                    {
                        test: /\.handlebars$/,
                        loader: "handlebars-loader"
                    }
                ]
            },
            postcss: [
                autoprefixer({browsers: ['last 2 version', '> 2%']})
            ],
            plugins: [
                new webpack.ResolverPlugin(
                    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
                ),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.OccurenceOrderPlugin(true),
                new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
                new ExtractTextPlugin('[name].css'),
                new HtmlWebpackPlugin({
                    inject: true,
                    filename: '../../index.html',
                    template: 'static/src/index.html'
                })
            ],
            devtool: 'sourcemap',
            cache: true
        };


    if (options.prod) {
        config.output = {
            path: p.join(__dirname, 'static', 'public', 'assets', 'compiled'),
                filename: '[name].[hash].js',
                chunkFilename: '[chunkName].js',
                publicPath: '/assets/compiled/',
                pathinfo: !!options.pathinfo,
                hash: true
        };
        config.plugins = [
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
            ),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin(true),
            new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),
            new ExtractTextPlugin('[name].[hash].css'),
            new HtmlWebpackPlugin({
                inject: true,
                filename: '../../index.html',
                template: 'static/src/index.html'
            })
        ]
    }

    if (options.uglify) {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    return config;
};
