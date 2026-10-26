import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../core/accordion";
import { Card } from "../../core/card";
import { Skeleton } from "../../core/skeleton";
import { DescriptionList, type DescriptionListItem } from "./index";

// Dados fictícios, no formato da aba "Perfil & assessment" do protótipo (HCK-308).
const pessoais: DescriptionListItem[] = [
  { label: "Nome completo", value: "Marina Alves Duarte", span: 2 },
  { label: "Nome social", value: null },
  { label: "Data de nascimento", value: "14/03/1994" },
  { label: "Gênero", value: "Feminino" },
  { label: "Estado civil", value: "Solteira" },
  { label: "E-mail corporativo", value: "marina.duarte@empresa.com.br", span: 2 },
  { label: "Telefone", value: "(11) 98844-2210" },
  { label: "Contato de emergência", value: "Helena Duarte · mãe · (11) 99712-3380", span: 3 },
];

const cargo: DescriptionListItem[] = [
  { label: "Cargo", value: "Analista de Operações Pleno", span: 2 },
  { label: "Departamento", value: "Operações" },
  { label: "Centro de custo", value: "CC-4120 · Operações" },
  { label: "Liderança direta", value: "Rafael Moreira", span: 2 },
];

const meta = {
  title: "Platform/Padrões/DescriptionList",
  component: DescriptionList,
  args: { items: pessoais, columns: 3, className: "w-full max-w-[920px]" },
  parameters: {
    docs: {
      description: {
        component:
          "Lista de leitura rótulo/valor (`<dl>`): o rótulo em cima, o valor embaixo, numa " +
          "grade de `columns` colunas. Cada item ocupa `span` colunas, até o total da lista.\n\n" +
          "Valor ausente — `null`, `undefined`, `false` ou texto vazio — mostra `emptyValue` " +
          "(padrão \"—\"). Só leitura: nada é clicável nem editável; o valor é o que a tela " +
          "passa.\n\n" +
          "Responsiva por conta própria: uma coluna abaixo de 640px; com `columns={3}`, duas " +
          "colunas até 1024px e três a partir daí.\n\n" +
          "Proposta para o perfil da pessoa do DHO (HCK-308): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Três colunas, com `span` por campo — a grade de "Informações pessoais". */
export const TresColunas: Story = {};

/** Duas colunas: um campo com `span` maior que a lista ocupa a linha inteira. */
export const DuasColunas: Story = {
  args: { items: cargo, columns: 2, className: "w-full max-w-[640px]" },
};

/** Uma coluna: o `span` não tem efeito. */
export const UmaColuna: Story = {
  args: { items: cargo, columns: 1, className: "w-full max-w-[360px]" },
};

/**
 * Campo que existe e está sem valor mostra "—": `null`, `undefined`, `false` e
 * texto vazio (ou só espaços). Zero é valor e aparece.
 */
export const ValorVazio: Story = {
  args: {
    items: [
      { label: "Nome social", value: null },
      { label: "Complemento", value: undefined },
      { label: "Telefone", value: "" },
      { label: "Dependentes", value: 0 },
    ],
  },
};

/** `emptyValue` troca o "—" quando a tela prefere um texto. */
export const TextoParaVazio: Story = {
  args: {
    emptyValue: "Não informado",
    items: [
      { label: "Nome social", value: null },
      { label: "Gênero", value: "Feminino" },
      { label: "Estado civil", value: "" },
    ],
  },
};

/** O valor aceita conteúdo: um texto composto, um número formatado, um selo. */
export const ValorComposto: Story = {
  args: {
    columns: 2,
    items: [
      { label: "Tipo de contrato", value: <>CLT · <span className="text-muted-foreground">tempo indeterminado</span></> },
      { label: "Tempo de casa", value: "1 ano e 8 meses" },
    ],
  },
};

/**
 * Carregando: a tela mostra os rótulos e o esqueleto no valor, para a grade não
 * pular quando os dados chegam.
 */
export const Carregando: Story = {
  args: {
    items: pessoais.map((item) => ({ ...item, value: <Skeleton className="mt-0.5 h-4 w-3/4" /> })),
  },
};

/** Tela estreita: uma coluna, e o `span` deixa de valer. */
export const TelaEstreita: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  args: { className: "w-full" },
};

/**
 * Como o perfil usa: seções recolhíveis (`Accordion` com `type="multiple"`),
 * cada uma num `Card` e com a sua lista. O líder só lê — não há ação de editar.
 */
export const EmSecoesRecolhiveis: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["pessoais"]} className="flex w-full max-w-[960px] flex-col gap-4">
      {[
        { id: "pessoais", titulo: "Informações pessoais", itens: pessoais },
        { id: "cargo", titulo: "Cargo", itens: cargo },
      ].map((secao) => (
        <Card key={secao.id}>
          <AccordionItem value={secao.id} className="border-b-0 px-5">
            <AccordionTrigger className="text-base font-semibold">{secao.titulo}</AccordionTrigger>
            <AccordionContent>
              <DescriptionList items={secao.itens} columns={3} />
            </AccordionContent>
          </AccordionItem>
        </Card>
      ))}
    </Accordion>
  ),
};
