import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "./index";

const meta = {
  title: "Core/Button",
  component: Button,
  args: { children: "Salvar" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Ação principal da tela. A cor vem do token, então o tema do cliente a alcança. */
export const Padrao: Story = {};

/** Ação secundária, ao lado de uma principal. */
export const Contorno: Story = { args: { variant: "outline", children: "Cancelar" } };

/** Ação que remove ou desfaz algo. */
export const Destrutivo: Story = {
  args: { variant: "destructive", children: <><Trash2 className="mr-2 h-4 w-4" />Excluir</> },
};

/** Sem moldura, para ações dentro de uma linha ou de um cabeçalho. */
export const Fantasma: Story = { args: { variant: "ghost", children: "Ver detalhes" } };

/** Enquanto a ação corre, o botão não aceita um segundo clique. */
export const Carregando: Story = {
  args: {
    disabled: true,
    children: <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</>,
  },
};

/** Indisponível — por permissão ou por formulário incompleto. */
export const Desabilitado: Story = { args: { disabled: true } };

/** Os três tamanhos, lado a lado. O padrão é 40px de altura. */
export const Tamanhos: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Pequeno</Button>
      <Button>Padrão</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon" aria-label="Adicionar"><Plus className="h-4 w-4" /></Button>
    </div>
  ),
};
