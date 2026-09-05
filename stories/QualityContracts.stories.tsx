import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContentCell, DateCell, NumberCell, PersonCell, StatusCell } from "../src";

const meta = { title: "Contracts/Quality additions" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const CellsContract: Story = {
  render: () => <div>
    <ContentCell title="Cultura que aproxima" metadata="Comunicação interna" />
    <PersonCell /><StatusCell label="Publicado" />
    <DateCell value="2026-09-03" /><NumberCell value={1280} />
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Não informado")).toBeVisible();
    await expect(canvas.getByText("03/09/2026")).toBeVisible();
    await expect(canvas.getByText("1.280")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Detalhes do conteúdo" }));
    await expect(canvas.getByText("Comunicação interna")).toBeVisible();
  },
};
