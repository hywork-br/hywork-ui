import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";

import "./fonts.css";
import "../tokens/tema.css";

function Surface({
  children,
  flush = false,
  surface,
}: {
  children: React.ReactNode;
  flush?: boolean;
  surface: "admin" | "portal";
}) {
  useEffect(() => {
    document.documentElement.dataset.surface = surface;
    return () => {
      delete document.documentElement.dataset.surface;
    };
  }, [surface]);

  return (
    <div
      className={flush ? "hw-story-frame hw-story-frame--flush" : "hw-story-frame"}
      data-surface={surface}
    >
      {children}
    </div>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <Surface
        flush={context.parameters.layout === "fullscreen"}
        surface={context.globals.surface === "portal" ? "portal" : "admin"}
      >
        <Story />
      </Surface>
    ),
  ],
  globalTypes: {
    surface: {
      description: "Densidade e contexto de uso",
      toolbar: {
        dynamicTitle: true,
        icon: "browser",
        items: [
          { title: "Admin", value: "admin" },
          { title: "Portal", value: "portal" },
        ],
      },
    },
  },
  initialGlobals: { surface: "admin" },
  parameters: {
    a11y: { test: "error" },
    backgrounds: { disable: true },
    controls: { expanded: true },
    layout: "fullscreen",
  },
};

export default preview;
