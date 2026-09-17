import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/montserrat";
import "./static/package.css";
import "./fonts.css";
const preview: Preview = {
  parameters: { layout: "padded", controls: { expanded: true } },
};
export default preview;
