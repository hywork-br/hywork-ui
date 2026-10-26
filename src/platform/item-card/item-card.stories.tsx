import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback } from "../../core/avatar";
import { Badge } from "../../core/badge";
import { Button } from "../../core/button";
import { ItemCard } from "./index";

const meta = {
  title: "Platform/Padrões/ItemCard",
  component: ItemCard,
  args: { title: "Desafio de integração" },
  parameters: {
    docs: {
      description: {
        component:
          "Card de item. Substitui as 21 implementações do Platform, que " +
          "variavam o raio de 8 a 24px e o respiro de 12 a 24px.\n\n" +
          "Anatomia fixa: mídia · título · metadados · ações. Sem sombra — ela " +
          "fica reservada a sobreposições, não a estrutura.",
      },
    },
  },
} satisfies Meta<typeof ItemCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: título e descrição. */
export const Padrao: Story = { args: { description: "Encerra em 12 dias" } };

/** Com indicador de estado ao lado do título. */
export const ComEstado: Story = {
  args: { description: "Encerra em 12 dias", status: <Badge variant="positive">Ativo</Badge> },
};

/** Com mídia à esquerda — avatar, ícone ou miniatura. */
export const ComMidia: Story = {
  args: {
    title: "Ana Ribeiro",
    description: "Pessoas · admitida em 12/03/2024",
    media: (
      <Avatar>
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
    ),
    status: <Badge variant="neutral">Rascunho</Badge>,
  },
};

/** Com ações no rodapé. */
export const ComAcoes: Story = {
  args: {
    description: "Encerra em 12 dias",
    status: <Badge variant="attention">Pendente</Badge>,
    actions: (
      <>
        <Button size="sm">Abrir</Button>
        <Button size="sm" variant="outline">
          Duplicar
        </Button>
      </>
    ),
  },
};

/** Card inteiro clicável — o título vira o alvo acessível. */
export const Clicavel: Story = {
  args: { description: "Encerra em 12 dias", onOpen: () => undefined },
};

/** Conteúdo extra que não cabe na anatomia entra abaixo dos metadados. */
export const ComConteudoProprio: Story = {
  args: {
    description: "Encerra em 12 dias",
    children: (
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/3 rounded-full bg-primary" />
      </div>
    ),
  },
};

// Dados inventados para a forma vertical.
const equipe = [
  { id: "1", iniciais: "LM", titulo: "Lara Menezes", descricao: "Analista de Suporte", status: <Badge variant="positive" tone="subtle">Em dia</Badge> },
  { id: "2", iniciais: "OT", titulo: "Otávio Teixeira Bragança de Albuquerque", descricao: "Coordenador de Projetos Especiais", status: <Badge variant="attention" tone="subtle">1 pendência</Badge> },
  { id: "3", iniciais: "CP", titulo: "Cecília Prado", descricao: "Designer", status: <Badge variant="neutral">Sem ciclo</Badge> },
  { id: "4", iniciais: "BN", titulo: "Bruno Nakamura", descricao: "Desenvolvedor", status: undefined },
  { id: "5", iniciais: "IS", titulo: "Iara Santos", descricao: "Analista Financeira Sênior", status: <Badge variant="positive" tone="subtle">Em dia</Badge> },
];

const iniciais = (texto: string) => (
  <Avatar>
    <AvatarFallback>{texto}</AvatarFallback>
  </Avatar>
);

/**
 * Vertical: a mídia em cima, num quadro de 108px — passe um `Avatar` (foto ou
 * iniciais), que o preenche —, o título centralizado numa linha (cortado com
 * reticências), a descrição, o estado numa linha própria e as ações em largura
 * total no fim. A moldura é a da decisão da PO: raio 12, respiro 24, sem sombra.
 *
 * Proposta para a lista de Pessoas do DHO (HCK-308): o visual aguarda o aval da PO.
 */
export const Vertical: Story = {
  args: {
    orientation: "vertical",
    title: "Lara Menezes",
    description: "Analista de Suporte",
    media: iniciais("LM"),
    status: <Badge variant="positive" tone="subtle">Em dia</Badge>,
    actions: (
      <Button size="sm" variant="outline">
        Acompanhar
      </Button>
    ),
    className: "w-[248px]",
  },
};

/**
 * Em grade, a tela escolhe as colunas (aqui, `repeat(auto-fill, minmax(232px,
 * 1fr))`). As ações ficam no pé de todos os cards da mesma linha, mesmo quando
 * o título ou a descrição de um deles é mais longo.
 */
export const VerticalEmGrade: Story = {
  render: () => (
    <ul className="grid w-full max-w-[1100px] grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
      {equipe.map((p) => (
        <ItemCard
          key={p.id}
          as="li"
          orientation="vertical"
          title={p.titulo}
          description={p.descricao}
          media={iniciais(p.iniciais)}
          status={p.status}
          actions={
            <Button size="sm" variant="outline">
              Acompanhar
            </Button>
          }
        />
      ))}
    </ul>
  ),
};

/** Vertical clicável: o card inteiro abre o item, e as ações continuam à parte. */
export const VerticalClicavel: Story = {
  args: {
    orientation: "vertical",
    title: "Bruno Nakamura",
    description: "Desenvolvedor",
    media: iniciais("BN"),
    onOpen: () => undefined,
    className: "w-[248px]",
  },
};

/** Vertical mínima: só título e descrição. */
export const VerticalSemMidia: Story = {
  args: { orientation: "vertical", description: "Encerra em 12 dias", className: "w-[248px]" },
};
