import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./index";

const meta = {
  title: "Core/Badge",
  component: Badge,
  args: { children: "Ativo" },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Os cinco papéis. A tela informa o papel, nunca a cor — é o que permite mudar
 * a paleta sem caçar `bg-green-100` em cada arquivo.
 */
export const Papeis: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="positive">Ativo</Badge>
      <Badge variant="attention">Pendente</Badge>
      <Badge variant="negative">Rejeitado</Badge>
      <Badge variant="informative">Agendado</Badge>
      <Badge variant="neutral">Rascunho</Badge>
    </div>
  ),
};

/** Qual papel usar, pelo que o estado significa na tela. */
export const QuandoUsarCada: Story = {
  render: () => (
    <div className="space-y-2 text-sm">
      <p><Badge variant="positive">positive</Badge> deu certo, está no ar, foi aprovado</p>
      <p><Badge variant="attention">attention</Badge> espera alguém, está em curso, venceu</p>
      <p><Badge variant="negative">negative</Badge> falhou, foi recusado, foi cancelado</p>
      <p><Badge variant="informative">informative</Badge> informa sem julgar</p>
      <p><Badge variant="neutral">neutral</Badge> rascunho, inativo, arquivado</p>
    </div>
  ),
};

/** Com ícone à esquerda do texto. */
export const ComIcone: Story = {
  render: () => (
    <Badge variant="positive">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
      </svg>
      Publicado
    </Badge>
  ),
};

/** Sem preenchimento, para rótulo que não é estado — uma tag, um tipo. */
export const Contorno: Story = { args: { variant: "outline", children: "Comunicado" } };
