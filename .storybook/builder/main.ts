import type { StorybookConfig } from "@storybook/react-vite";

// Catálogo do Builder. Lê apenas as stories deste consumidor:
// primitivas de core/ e padrões de builder/.
const config: StorybookConfig = {
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["../static"],
  stories: [
    "../../src/core/**/*.stories.tsx",
    "../../src/builder/**/*.stories.tsx",
    "../../stories/builder/**/*.stories.tsx",
  ],
};
export default config;
