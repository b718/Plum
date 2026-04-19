/** @type {import('prettier').Config} */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^(react|next)(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@plum/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
