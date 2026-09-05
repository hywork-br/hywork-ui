import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DetailSpecimens, QualityWorkspace } from "./details/quality-workspace";

const meta = {
  title: "Lab/Interface details",
  component: QualityWorkspace,
  parameters: { layout: "fullscreen" },
  beforeEach: () => { sessionStorage.removeItem("hywork.collections.contents.views.v1"); },
} satisfies Meta<typeof QualityWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Workspace: Story = {};
export const DetailComparison: Story = { render: () => <DetailSpecimens /> };
export const FullJourney: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox");
    await userEvent.click(canvas.getByRole("button", { name: "Editar Cultura que aproxima" }));
    await userEvent.click(canvas.getByText("Cenário de demonstração"));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Falhar próximo salvamento local" }));
    const title = canvas.getByRole("textbox", { name: "Título do conteúdo" });
    await userEvent.clear(title);
    await userEvent.type(title, "Cultura em movimento");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar título" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Seu título continua aqui");
    await expect(title).toHaveValue("Cultura em movimento");
    await userEvent.click(canvas.getByRole("button", { name: "Tentar novamente" }));
    await expect(within(canvas.getByRole("table")).getByText("Cultura em movimento")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Fechar edição" }));
    await expect(search).toHaveFocus();
    await userEvent.click(canvas.getByLabelText("Selecionar página"));
    await expect(canvas.getByRole("region", { name: "Ações da seleção" })).toBeVisible();
    canvas.getByRole("button", { name: "Arquivar selecionados desta página (5)" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(search).toHaveFocus();
    await expect(canvas.getByText("5 conteúdo(s) desta página arquivado(s) na fixture.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Preferências de visualização" }));
    await userEvent.selectOptions(canvas.getByLabelText("Densidade"), "compact");
    await userEvent.click(canvas.getByText("Gerenciar visões"));
    await userEvent.type(canvas.getByLabelText("Nome da visão"), "Editorial compacta");
    await userEvent.click(canvas.getByRole("button", { name: "Salvar visão" }));
    await expect(canvas.getByLabelText("Visões salvas")).toHaveValue("view-1");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "Preferências de visualização" })).toHaveFocus();
  },
};
