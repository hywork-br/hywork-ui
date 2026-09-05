import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { ThemeLab } from "./themes/theme-lab";

const meta = {
  title: "Labs/Temas de tenant",
  component: ThemeLab,
  parameters: {
    docs: {
      description: {
        component:
          "Protótipo de validação local do contrato --color-*. Não persiste tema, não migra consumidores e não implementa dark mode do produto.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof ThemeLab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidationLab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preview = canvas.getByTestId("theme-preview");
    const initialPrimary = preview.style.getPropertyValue("--color-primary");
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Combinação intencionalmente rejeitada",
      })
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent("Rejeitada");
    await expect(preview.style.getPropertyValue("--color-primary")).toBe(
      initialPrimary
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Acento escuro aprovado" })
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Aprovada");
  },
};
