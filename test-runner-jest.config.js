import { getJestConfig } from "@storybook/test-runner";

const defaults = getJestConfig();
export default {
  ...defaults,
  setupFilesAfterEnv: [...(defaults.setupFilesAfterEnv ?? []), "<rootDir>/.storybook/test-hooks.mjs"],
};
