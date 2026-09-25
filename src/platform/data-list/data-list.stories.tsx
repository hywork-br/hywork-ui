import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../../core/badge";
import { EmptyState } from "../empty-state";
import { DataList, type DataListColumn } from "./index";

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  estado: "ativo" | "convidado" | "inativo";
}

const PESSOAS: Pessoa[] = [
  { id: "1", nome: "Ana Ribeiro", email: "ana@hywork.com.br", estado: "ativo" },
  { id: "2", nome: "Bruno Lima", email: "bruno@hywork.com.br", estado: "convidado" },
  { id: "3", nome: "Carla Souza", email: "carla@hywork.com.br", estado: "inativo" },
];

const VARIANTE = {
  ativo: "positive",
  convidado: "attention",
  inativo: "neutral",
} as const;

const COLUNAS: DataListColumn<Pessoa>[] = [
  { key: "nome", header: "Nome", cell: (p) => p.nome },
  { key: "email", header: "E-mail", cell: (p) => p.email },
  {
    key: "estado",
    header: "Status",
    width: "140px",
    cell: (p) => <Badge variant={VARIANTE[p.estado]}>{p.estado}</Badge>,
  },
];

const meta = {
  title: "Platform/Padrões/DataList",
  component: DataList<Pessoa>,
  args: { items: PESSOAS, columns: COLUNAS, getKey: (p: Pessoa) => p.id },
  parameters: {
    docs: {
      description: {
        component:
          "Listagem tabular. A maior migração do projeto: 44 telas listam " +
          "dados sem ela — 17 com `<table>` cru e 27 montando com `div` e grid.\n\n" +
          "As colunas são declaradas, não montadas. Carregamento e estado " +
          "vazio são do componente, não de cada tela.",
      },
    },
  },
} satisfies Meta<typeof DataList<Pessoa>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O caso comum. */
export const Padrao: Story = { args: { "aria-label": "Colaboradores" } };

/** Enquanto os dados chegam, o esqueleto mantém a estrutura da tabela. */
export const Carregando: Story = { args: { loading: true } };

/** Sem resultados, o estado vazio entra no lugar das linhas. */
export const Vazio: Story = {
  args: {
    items: [],
    empty: <EmptyState title="Nenhum colaborador encontrado" description="Ajuste os filtros." />,
  },
};

/** Linha inteira clicável, para abrir o detalhe do item. */
export const LinhaClicavel: Story = { args: { onRowClick: () => undefined } };

/**
 * Listagem larga: abaixo da largura mínima a tabela rola dentro do próprio
 * container, e não espreme as colunas nem faz a página rolar na horizontal.
 */
export const Larga: Story = {
  args: { "aria-label": "Campanhas", minWidth: "860px" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
