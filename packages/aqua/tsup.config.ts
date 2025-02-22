import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    router: "src/router.ts",
    "function/server": "src/function/server.ts",
    "function/client": "src/function/client.ts",
    plugin: "src/plugin/plugin.ts",
    "plugin/babel": "src/plugin/babel.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  esbuildOptions: (options) => {
    options.external = ["babel-loader", "@babel/preset-typescript"];
  },
});
