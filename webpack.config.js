const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
module.exports = {
    entry: "./src/client/js/main.js",
    watch: true,
    plugins: [new MiniCssExtractPlugin({
        filename: "css/style.css",
    })],
    mode: 'development',
    watch: true,
    output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [['@babel/preset-env', { targets: "defaults" }]],
              },
            },
          },
          {
            test: /\.scss$/,
            use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
          }, // webpack은 맨 끝 우측에서 좌측으로 읽는다. 그래서 sass가 끝에있음.
        ],
      },
};
