import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../../core/badge";
import { EmptyState } from "../empty-state";
import { ListPagination } from "../list-pagination";
import { DataList, type DataListColumn, type DataListSelection } from "./index";

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
          "vazio são do componente, não de cada tela.\n\n" +
          "Com `selection`, a primeira coluna ganha as caixas de seleção, e o " +
          "cabeçalho, a caixa que marca as linhas visíveis. A seleção é " +
          "controlada: a tela guarda as chaves, inclusive entre páginas. A " +
          "contagem nas stories de seleção é só demonstração: a barra de ação " +
          "em massa ainda não tem padrão decidido.",
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

const MUITAS: Pessoa[] = [
  ...PESSOAS,
  { id: "4", nome: "Diego Martins", email: "diego@hywork.com.br", estado: "ativo" },
  { id: "5", nome: "Elisa Prado", email: "elisa@hywork.com.br", estado: "ativo" },
  { id: "6", nome: "Fábio Nunes", email: "fabio@hywork.com.br", estado: "convidado" },
];

/**
 * Listras por padrão (Rick, 06/10/2026): linhas pares em gray-50, cursor em
 * gray-100 — visível também sobre a linha listrada. Passe o cursor nas linhas.
 */
export const Listras: Story = { args: { items: MUITAS, "aria-label": "Colaboradores" } };

/** `striped={false}`: só onde a linha já tem fundo próprio por estado. */
export const SemListras: Story = { args: { items: MUITAS, striped: false, "aria-label": "Colaboradores" } };

/**
 * A tela guarda as chaves marcadas; o componente devolve o conjunto novo a cada
 * clique. `getLabel` dá nome a cada caixa — "Selecionar Ana Ribeiro" —, porque
 * uma coluna de caixas sem nome é uma fileira de "caixa de seleção" no leitor
 * de tela.
 */
function useSelecao(inicial: string[] = []): DataListSelection<Pessoa> {
  const [chaves, setChaves] = React.useState<ReadonlySet<string>>(() => new Set(inicial));
  return { selectedKeys: chaves, onChange: setChaves, getLabel: (p) => `Selecionar ${p.nome}` };
}

function Contagem({ selection }: { selection: DataListSelection<Pessoa> }) {
  const quantas = selection.selectedKeys.size;
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {quantas === 1 ? "1 selecionada" : `${quantas} selecionadas`}
    </p>
  );
}

/**
 * Seleção de linhas. Clique na caixa ou em volta dela, na mesma célula: a
 * célula inteira é o alvo. Pelo teclado, Tab chega à caixa e Espaço marca. A
 * linha marcada fica no cinza de seleção da tabela (`--hw-table-selected`, Rick,
 * 06/10/2026), acima da listra e do cursor.
 */
export const ComSelecao: Story = {
  args: { items: MUITAS, "aria-label": "Colaboradores" },
  render: function Render(args) {
    const selection = useSelecao(["2", "5"]);
    return (
      <div className="space-y-3">
        <Contagem selection={selection} />
        <DataList {...args} selection={selection} />
      </div>
    );
  },
};

/**
 * Parte das linhas visíveis marcada: a caixa do cabeçalho fica em estado misto.
 * Um clique nela marca todas as linhas visíveis; com todas marcadas, o clique
 * seguinte desmarca.
 */
export const SelecaoParcial: Story = {
  args: { items: PESSOAS, "aria-label": "Colaboradores" },
  render: function Render(args) {
    const selection = useSelecao(["1"]);
    return (
      <div className="space-y-3">
        <Contagem selection={selection} />
        <DataList {...args} selection={{ ...selection, selectAllLabel: "Selecionar todos os colaboradores" }} />
      </div>
    );
  },
};

const PAGINAS: Pessoa[] = [
  ...MUITAS,
  { id: "7", nome: "Gabriela Rocha", email: "gabriela@hywork.com.br", estado: "ativo" },
  { id: "8", nome: "Hugo Teixeira", email: "hugo@hywork.com.br", estado: "inativo" },
  { id: "9", nome: "Íris Campos", email: "iris@hywork.com.br", estado: "ativo" },
];
const POR_PAGINA = 3;

/**
 * Listagem paginada, como a aba Pendências do ciclo (HCK-258). A caixa do
 * cabeçalho cuida só das linhas desta página: marcar ou desmarcar a página não
 * mexe nas chaves das outras, que a tela guarda. "Selecionar todas as N" (todas
 * as que batem com o filtro) é da tela, não do componente.
 */
export const SelecaoEntrePaginas: Story = {
  args: { items: PAGINAS, "aria-label": "Pendências", rowHeight: "h-[76px]" },
  render: function Render(args) {
    const [pagina, setPagina] = React.useState(1);
    const selection = useSelecao(["8"]);
    const visiveis = args.items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    return (
      <div className="space-y-3">
        <Contagem selection={selection} />
        <DataList
          {...args}
          items={visiveis}
          selection={{ ...selection, selectAllLabel: "Selecionar todas desta página" }}
        />
        <ListPagination
          page={pagina}
          perPage={POR_PAGINA}
          total={args.items.length}
          onPageChange={setPagina}
          itemLabel="pessoas"
        />
      </div>
    );
  },
};

/**
 * `isSelectable`: a linha que não pode ser marcada mostra a caixa desabilitada,
 * e a caixa do cabeçalho ignora essa linha ao marcar a página e ao calcular o
 * estado misto.
 */
export const SelecaoComLinhaIndisponivel: Story = {
  args: { items: PESSOAS, "aria-label": "Colaboradores" },
  render: function Render(args) {
    const selection = useSelecao();
    return (
      <div className="space-y-3">
        <Contagem selection={selection} />
        <DataList {...args} selection={{ ...selection, isSelectable: (p) => p.estado !== "inativo" }} />
      </div>
    );
  },
};

/**
 * Com a linha clicável, o clique na caixa marca e não abre o item: a coluna de
 * seleção nunca dispara `onRowClick`.
 */
export const SelecaoComLinhaClicavel: Story = {
  args: { items: PESSOAS, "aria-label": "Colaboradores" },
  render: function Render(args) {
    const selection = useSelecao();
    const [aberto, setAberto] = React.useState<string | null>(null);
    return (
      <div className="space-y-3">
        <Contagem selection={selection} />
        <DataList {...args} selection={selection} onRowClick={(p) => setAberto(p.nome)} />
        <p className="text-sm text-muted-foreground">Aberto: {aberto ?? "nenhum"}</p>
      </div>
    );
  },
};

/**
 * Enquanto carrega, as linhas não têm caixa e a do cabeçalho fica desabilitada,
 * no mesmo lugar: a coluna não muda de largura quando os dados chegam. Vazio e
 * erro não montam a tabela, e por isso não têm caixa nenhuma.
 */
export const SelecaoCarregando: Story = {
  args: { loading: true, loadingRows: 3, "aria-label": "Colaboradores" },
  render: function Render(args) {
    const selection = useSelecao(["1"]);
    return <DataList {...args} selection={selection} />;
  },
};
