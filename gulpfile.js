/* jshint ignore:start */
var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
require('es6-promise').polyfill();

var myWebpackConf = {
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path: "./"
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            }
        })
    ],
    module: {
        loaders: [
            {   test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel",
                query: {
                    presets: ["es2015", "react"]
                }},
            {   test: /\.scss$/,
                loaders: ["style", "css", "sass"]
                }

        ]
    }
};

var myDevConfig = Object.create(myWebpackConf);
myDevConfig.devtool = "cheap-module-source-map";
//myDevConfig.devtool = "source-map";
myDevConfig.debug = true;
myDevConfig.plugins = [];

var devCompiler = webpack(myDevConfig);

gulp.task("watch", function(callback) {
    devCompiler.run(function(err, stats) {
		if (err) {
            throw new gutil.PluginError("watch", err);
        }
        var jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
            console.log('\u0007');
        }

		gutil.log("[watch]", stats.toString({
			colors: true
		}));

		callback();
	});
});


gulp.task("default", ["watch"], function() {
	gulp.watch(["src/**/*", "style/**/*"], ["watch"]);
});

gulp.task("_build", function(callback){
    webpack(myWebpackConf, function(err, stats) {
		if(err) throw new gutil.PluginError("_build", err);
		gutil.log("[_build]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task("build", ["_build"]);
/* jshint ignore:end */
