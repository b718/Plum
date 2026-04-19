/** @type {import('prettier').Config} */
const config = {
  printWidth: 105,
  useTabs: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: ["^(react|next)(/.*)?$", "<THIRD_PARTY_MODULES>", "^@plum/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
