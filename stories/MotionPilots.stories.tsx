import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FeaturePilot } from "./pilots/feature-pilot";
import { academy, tv } from "./pilots/model";

const meta = {
  title: "Pilots/Motion experiment",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Experimento local com Motion: chips, filtros contextuais e confirmação de salvamento. Teclado e movimento reduzido têm resposta instantânea. Não integra o pacote distribuído nem migra produto.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const TvCorporativa: Story = {
  render: () => <FeaturePilot config={tv} motionPilot />,
};
export const Academy: Story = {
  render: () => <FeaturePilot config={academy} motionPilot />,
};

/** Run in an actual browser: jsdom cannot verify interpolated visual states. */
export const MotionContract: Story = {
  render: () => <FeaturePilot config={tv} motionPilot />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /^Mais filtros$/ });
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const sample = async () => {
      const frames: Array<{ opacity: number; transform: string }> = [];
      const start = performance.now();
      while (performance.now() - start < 400) {
        const panel = document.querySelector(".hw-motion-popover");
        if (panel) {
          const css = getComputedStyle(panel);
          frames.push({
            opacity: Number(css.opacity),
            transform: css.transform,
          });
        }
        await new Promise(requestAnimationFrame);
      }
      return frames;
    };
    // This catches animation wrappers that initialize while Radix Content is absent.
    for (let opening = 0; opening < 2; opening += 1) {
      const [frames] = await Promise.all([sample(), userEvent.click(trigger)]);
      await expect(frames.length).toBeGreaterThan(0);
      if (reduced) {
        await expect(
          frames.every(
            (frame) =>
              frame.opacity === 1 &&
              (frame.transform === "none" ||
                frame.transform === "matrix(1, 0, 0, 1, 0, 0)")
          )
        ).toBe(true);
      } else {
        await expect(
          frames.some((frame) => frame.opacity > 0 && frame.opacity < 1)
        ).toBe(true);
      }
      await userEvent.keyboard("{Escape}");
      await expect(trigger).toHaveFocus();
    }
    await userEvent.keyboard("{Enter}");
    const keyboardFrames = await sample();
    await expect(keyboardFrames.length).toBeGreaterThan(0);
    await expect(keyboardFrames.every((frame) => frame.opacity === 1)).toBe(
      true
    );
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    canvasElement.dataset.motionContract = reduced
      ? "passed-reduced"
      : "passed-full";
  },
};
