import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/montserrat";
import "../static/builder.css";
import "./fonts.css";

// Tokens e preset do Builder — o catálogo renderiza com as mesmas
// variáveis que o consumidor recebe em produção.
const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    a11y: { test: "error" },
  },
};
export default preview;
