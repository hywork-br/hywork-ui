import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";

import "../tokens/tema.css";

function Surface({ children, flush = false }: { children: React.ReactNode; flush?: boolean }) {
  useEffect(() => {
    document.documentElement.dataset.surface = "admin";
    return () => {
      delete document.documentElement.dataset.surface;
    };
  }, []);

  return (
    <div className={flush ? "hw-story-frame hw-story-frame--flush" : "hw-story-frame"}>
      {children}
    </div>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <Surface flush={context.parameters.layout === "fullscreen"}>
        <Story />
      </Surface>
    ),
  ],
  parameters: {
    a11y: { test: "error" },
    backgrounds: { disable: true },
    controls: { expanded: true },
    layout: "fullscreen",
  },
};

export default preview;
