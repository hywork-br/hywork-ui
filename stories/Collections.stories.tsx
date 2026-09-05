import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { CollectionDemo } from "./collections/collection-demo";

const meta = {
  title: "Patterns/Coleções operacionais",
  component: CollectionDemo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CollectionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Contents: Story = {
  beforeEach: () => {
    sessionStorage.removeItem("hywork.collections.contents.views.v1");
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Selecionar página"));
    await expect(canvas.getByText(/5 selecionados/)).toBeVisible();
    await userEvent.type(canvas.getByRole("searchbox"), "Cultura");
    await expect(canvas.getByText("1–1 de 1")).toBeVisible();
    await userEvent.click(canvas.getByText("Gerenciar visões"));
    await userEvent.type(canvas.getByLabelText("Nome da visão"), "Cultura");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar visão" }));
    await userEvent.clear(canvas.getByRole("searchbox"));
    await userEvent.selectOptions(
      canvas.getByLabelText("Visões salvas"),
      "view-1"
    );
    await expect(canvas.getByRole("searchbox")).toHaveValue("Cultura");
  },
};
