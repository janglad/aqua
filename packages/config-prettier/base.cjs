/** @typedef  {import("prettier").Config} PrettierConfig */

/** @type { PrettierConfig } */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};

module.exports = config;
