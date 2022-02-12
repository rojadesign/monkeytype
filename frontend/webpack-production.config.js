const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");

let circularImportNum = 0;

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/scripts/index.js"),
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    },
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              "@babel/plugin-transform-runtime",
              "@babel/plugin-transform-modules-commonjs",
            ],
          },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "public/js/"),
    filename: "monkeytype.js",
  },
  plugins: [
    // Ensure that there are no circular dependencies
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /./,
      failOnError: true,
      allowAsyncCycles: false, // Allow async webpack imports
      cwd: process.cwd(), // set current working dir for displaying module paths
      // `onDetected` is called for each module that is cyclical
      onDetected({ module: _webpackModuleRecord, paths }) {
        // `paths` will be an Array of the relative module paths that make up the cycle
        // `module` will be the module record generated by webpack that caused the cycle
        circularImportNum += 1;
        console.log(
          "\u001b[31mCircular import found: \u001b[0m" +
            paths.join("\u001b[31m -> \u001b[0m")
        );
      },
      // `onEnd` is called before the cycle detection ends
      onEnd() {
        let coloredImportNum = "";
        if (circularImportNum === 0)
          coloredImportNum = `\u001b[32m${circularImportNum}\u001b[0m`;
        else coloredImportNum = `\u001b[31m${circularImportNum}\u001b[0m`;
        console.log(`Found ${coloredImportNum} circular imports`);
        if (circularImportNum > 0) process.exit(1);
      },
    }),
  ],
};
