import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { ListPagination } from "./index";

const meta = {
  title: "Platform/Padrões/ListPagination",
  component: ListPagination,
  args: { page: 1, perPage: 20, total: 143, onPageChange: () => undefined },
} satisfies Meta<typeof ListPagination>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O caso comum: intervalo à esquerda, setas à direita. */
export const Padrao: Story = {
  render: function Render(args) {
    const [page, setPage] = React.useState(1);
    return <ListPagination {...args} page={page} onPageChange={setPage} itemLabel="colaboradores" />;
  },
};

/** Na primeira página, "anterior" fica inativo. */
export const PrimeiraPagina: Story = { args: { page: 1, itemLabel: "colaboradores" } };

/** Na última, "próxima" fica inativo e o intervalo mostra o resto. */
export const UltimaPagina: Story = { args: { page: 8, itemLabel: "colaboradores" } };

/** Cabendo tudo em uma página, os controles somem — não há para onde ir. */
export const PaginaUnica: Story = { args: { total: 12, itemLabel: "colaboradores" } };

/** Sem resultado, o componente não renderiza: o estado vazio fala por ele. */
export const SemResultados: Story = { args: { total: 0 } };

/** Durante o carregamento, os controles ficam inativos. */
export const Carregando: Story = { args: { page: 3, disabled: true, itemLabel: "colaboradores" } };
