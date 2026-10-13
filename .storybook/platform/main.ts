import type { StorybookConfig } from "@storybook/react-vite";

// Catálogo do Platform. Lê apenas as stories deste consumidor:
// primitivas de core/, padrões de platform/ e os gráficos (@hywork/ui/charts).
const config: StorybookConfig = {
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["../static"],
  stories: [
    "../../src/core/**/*.stories.tsx",
    "../../src/platform/**/*.stories.tsx",
    "../../src/charts/**/*.stories.tsx",
    "../../stories/platform/**/*.stories.tsx",
  ],
};
export default config;
