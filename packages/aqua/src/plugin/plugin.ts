import { RemoveFromClient } from "./babel";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

export const withAquaPlugin = (nextConfig: NextConfig): NextConfig => {
  return {
    ...nextConfig,
    webpack: (config: Configuration, context) => {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];

      config.module.rules.push({
        test: /\.aqua\.ts$/,
        issuerLayer: {
          or: ["ssr", "action-browser", "app-pages-browser"],
        },
        use: [
          context.defaultLoaders.babel,
          {
            loader: require.resolve("babel-loader"),
            options: {
              sourceMaps: context.dev,
              presets: [require.resolve("@babel/preset-typescript")],
              plugins: [RemoveFromClient],
            },
          },
        ],
      });

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, context);
      } else {
        return config;
      }
    },
  };
};
