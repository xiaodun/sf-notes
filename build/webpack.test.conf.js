var path = require("path");
var webpack = require("webpack");
const config = require("../config");
const vueLoaderConfig = require("./vue-loader.conf");
process.env.NODE_ENV = "test";
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/dist/",
    filename: "build.js"
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": path.resolve(__dirname, "..", "src"),
      "@root": path.resolve(__dirname, "../")
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]"
        }
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    proxyTable: {
      ["/" + "api"]: {
        target: `http:192.168.8.155:8888/`
      }
    }
  },
  performance: {
    hints: false
  },
  devtool: "inline-cheap-module-source-map",
  externals: [require("webpack-node-externals")()]
};
