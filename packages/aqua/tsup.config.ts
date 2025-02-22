import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    router: "src/router.ts",
    "function/function-server": "src/function/server.ts",
    "function/function-client": "src/function/client.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
});
