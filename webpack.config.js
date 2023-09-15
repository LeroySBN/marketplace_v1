const path = require("path");

module.exports = {
  mode: "development",
  entry: "./api/src/server.ts",
  target: "node", // Set the target environment to Node.js (Backend)
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  // devServer: {
  //   contentBase: "./dist"
  // },
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "api/dist") // Output directory for the API
  },
};
