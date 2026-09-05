import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { RecoveryDemo } from "./feedback/recovery-demo";

const meta = {
  title: "Patterns/Feedback e recuperação",
  component: RecoveryDemo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RecoveryDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Recovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByLabelText("Rascunho"));
    await userEvent.type(
      canvas.getByLabelText("Rascunho"),
      "Meu rascunho preservado"
    );
    await userEvent.click(canvas.getByLabelText("Simular offline"));
    await expect(canvas.getByRole("button", { name: "Salvar" })).toBeDisabled();
    await expect(canvas.getByLabelText("Rascunho")).toHaveValue(
      "Meu rascunho preservado"
    );
    await userEvent.click(canvas.getByLabelText("Simular offline"));
    await userEvent.click(canvas.getByLabelText("Simular conflito"));
    await userEvent.click(
      canvas.getByRole("button", { name: "Manter meu rascunho" })
    );
    await userEvent.click(canvas.getByRole("button", { name: "Salvar" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Rascunho salvo"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Arquivar" }));
    await userEvent.click(canvas.getByRole("button", { name: "Desfazer" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Publicar 3 itens" })
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Falhou: Cultura"
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Tentar novamente 1 item" })
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "3 de 3 itens publicados"
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Excluir permanentemente" })
    );
    const dialog = within(canvasElement.ownerDocument.body).getByRole(
      "alertdialog"
    );
    await expect(
      within(dialog).getByRole("button", { name: "Cancelar" })
    ).toHaveFocus();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancelar" })
    );
    await userEvent.click(canvas.getByLabelText("Permissão de edição"));
    await expect(canvas.getByRole("button", { name: "Salvar" })).toBeDisabled();
    await userEvent.click(canvas.getByLabelText("Permissão de edição"));
  },
};
