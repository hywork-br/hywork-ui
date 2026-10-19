import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../core/card";
import { EmptyState } from "../empty-state";
import { BarList, type BarListItem } from "./index";

const areas: BarListItem[] = [
  { id: "com", label: "Comercial", value: 78, max: 85, valueLabel: "92% · 78 de 85" },
  { id: "ope", label: "Operações", value: 112, max: 140, valueLabel: "80% · 112 de 140" },
  { id: "fin", label: "Financeiro", value: 21, max: 30, valueLabel: "70% · 21 de 30" },
  { id: "tec", label: "Tecnologia", value: 19, max: 38, valueLabel: "50% · 19 de 38" },
  { id: "rh", label: "Pessoas", value: 3, max: 12, valueLabel: "25% · 3 de 12" },
];

const meta = {
  title: "Platform/Padrões/BarList",
  component: BarList,
  args: { items: areas, "aria-label": "Adesão por área", className: "w-full max-w-[420px]" },
  parameters: {
    docs: {
      description: {
        component:
          "Lista de barras: uma linha por item, com rótulo, valor à direita e uma barra " +
          "proporcional. Para comparar poucos itens de uma mesma medida — adesão por área, " +
          "avaliações por etapa, respostas por opção.\n\n" +
          "A largura é `value / max`, limitada a 0–100%. O `max` do item vence o `max` da " +
          "lista, que vence o maior valor da lista; `max` zero dá barra vazia. A barra é " +
          "desenho: o leitor de tela ouve o rótulo e o texto da direita. Com `onSelect`, a " +
          "linha vira botão.\n\n" +
          "Proposta para o DHO (HCK-255): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof BarList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Max por item: cada área tem o seu total, e a barra mostra a fração dele. */
export const MaxPorItem: Story = {};

/**
 * Max da lista: todas as linhas na mesma escala — aqui, porcentagem. Sem
 * `valueLabel`, a direita mostra o `value`.
 */
export const MaxDaLista: Story = {
  args: {
    "aria-label": "Notas por pilar",
    max: 100,
    items: [
      { id: "res", label: "Resultados", value: 86, valueLabel: "86%" },
      { id: "com", label: "Comportamento", value: 74, valueLabel: "74%" },
      { id: "lid", label: "Liderança", value: 61, valueLabel: "61%" },
      { id: "ino", label: "Inovação", value: 48, valueLabel: "48%" },
    ],
  },
};

/** Sem max nenhum: o maior valor ocupa a linha inteira e os outros se comparam a ele. */
export const PeloMaiorValor: Story = {
  args: {
    "aria-label": "Avaliações por etapa",
    items: [
      { id: "nao", label: "Não iniciada", value: 12 },
      { id: "auto", label: "Autoavaliação", value: 31 },
      { id: "gestor", label: "Avaliação do gestor", value: 18 },
      { id: "cal", label: "Calibração", value: 6 },
      { id: "fim", label: "Concluída", value: 24 },
    ],
  },
};

/**
 * Clicável: com `onSelect`, a linha vira botão — Tab chega a ela, Enter e
 * Espaço a escolhem, e o anel de foco aparece.
 */
export const Clicavel: Story = {
  render: (args) => {
    const [escolhida, setEscolhida] = React.useState<string>("nenhuma");
    return (
      <div className="space-y-3">
        <BarList
          {...args}
          items={areas.map((item) => ({ ...item, onSelect: () => setEscolhida(String(item.label)) }))}
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Área escolhida: {escolhida}
        </p>
      </div>
    );
  },
};

/** Só algumas linhas clicáveis: as outras seguem só leitura. */
export const ParcialmenteClicavel: Story = {
  args: {
    items: areas.map((item, index) => (index % 2 === 0 ? { ...item, onSelect: () => undefined } : item)),
  },
};

/**
 * Zerado: valores zero, `max` zero e valor inválido dão barra vazia — nunca
 * NaN nem barra cheia por engano.
 */
export const Zerado: Story = {
  args: {
    "aria-label": "Adesão por área",
    items: [
      { id: "a", label: "Comercial", value: 0, max: 85, valueLabel: "0% · 0 de 85" },
      { id: "b", label: "Área sem público", value: 0, max: 0, valueLabel: "—" },
      { id: "c", label: "Operações", value: 0, max: 140, valueLabel: "0% · 0 de 140" },
    ],
  },
};

/**
 * Vazio: sem itens, a lista não desenha nada. A frase de "sem dados" é do
 * `EmptyState`, que a tela põe no lugar da lista.
 */
export const Vazio: Story = {
  args: { items: [] },
  render: (args) =>
    args.items.length > 0 ? (
      <BarList {...args} />
    ) : (
      <EmptyState className="w-full max-w-[420px]" icon={<BarChart3 />} title="Nenhuma resposta ainda" />
    ),
};

/** Rótulo longo numa coluna estreita: o texto quebra dentro da linha, sem estourá-la. */
export const RotuloLongo: Story = {
  args: {
    className: "w-full max-w-[280px]",
    items: [
      { id: "a", label: "Coordenação de Operações Logísticas Regionais", value: 41, max: 60, valueLabel: "68% · 41 de 60" },
      { id: "b", label: "Superintendência", value: 9, max: 10, valueLabel: "90% · 9 de 10" },
      { id: "c", label: "Departamentodenomecompridosemespaço", value: 2, max: 8, valueLabel: "25% · 2 de 8" },
    ],
  },
};

/** Num card, como no painel de resultados. */
export const EmCard: Story = {
  args: { className: undefined },
  render: (args) => (
    <Card className="w-full max-w-[480px]">
      <CardHeader>
        <CardTitle id="barlist-card-titulo">Adesão por área</CardTitle>
      </CardHeader>
      <CardContent>
        <BarList {...args} aria-label={undefined} aria-labelledby="barlist-card-titulo" />
      </CardContent>
    </Card>
  ),
};

const n = (v: number) => v.toFixed(1).replace(".", ",");
const timeVsEmpresa: [string, number, number][] = [
  ["Entrega e execução", 4.1, 3.8],
  ["Colaboração", 4.0, 3.9],
  ["Comunicação", 3.4, 3.7],
  ["Desenvolvimento de pessoas", 3.2, 3.5],
];

/**
 * Média por competência · time vs. empresa (HCK-259, L4): a barra é a média
 * do time e a marca, a da empresa, na mesma escala (`max` 5). Abaixo da
 * empresa, a linha fica em atenção. O leitor de tela ouve o `markerLabel`
 * depois do texto da direita.
 */
export const TimeVsEmpresa: Story = {
  args: {
    "aria-label": "Média por competência, time vs. empresa",
    max: 5,
    items: timeVsEmpresa.map(([label, time, empresa]) => ({
      id: label,
      label,
      value: time,
      marker: empresa,
      valueLabel: `${n(time)} · empresa ${n(empresa)}`,
      markerLabel: `Empresa: ${n(empresa)}`,
      tone: time < empresa ? ("attention" as const) : undefined,
    })),
  },
  render: (args) => (
    <div className="w-full max-w-[480px] space-y-2">
      <BarList {...args} />
      <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
        <span aria-hidden="true" className="inline-block h-3.5 w-0.5 rounded-full bg-foreground" />
        Média da empresa
      </p>
    </div>
  ),
};

/** Só o tom: a linha em atenção ganha a barra na cor de aviso. */
export const ComAtencao: Story = {
  args: {
    "aria-label": "Adesão por área",
    items: areas.map((item) => (item.value / (item.max ?? 1) < 0.5 ? { ...item, tone: "attention" as const } : item)),
  },
};

/** Marca clicável: a referência entra no nome do botão da linha. */
export const ComMarcaClicavel: Story = {
  args: {
    "aria-label": "Média por competência",
    max: 5,
    items: timeVsEmpresa.map(([label, time, empresa]) => ({
      id: label,
      label,
      value: time,
      marker: empresa,
      valueLabel: n(time),
      markerLabel: `Empresa: ${n(empresa)}`,
      onSelect: () => undefined,
    })),
  },
};
