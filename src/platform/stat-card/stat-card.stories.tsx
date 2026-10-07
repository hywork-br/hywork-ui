import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, CalendarClock, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "../../core/skeleton";
import { StatCard } from "./index";

const meta = {
  title: "Platform/Padrões/StatCard",
  component: StatCard,
  args: { label: "Participação", value: "68%", note: "41 de 60 iniciaram", className: "w-[260px]" },
  parameters: {
    docs: {
      description: {
        component:
          "Cartão de indicador: rótulo, valor, nota e, opcionalmente, ícone e " +
          "variação.\n\n" +
          "A variação chega **já formatada** (\"+0,2\", \"+3 p.p.\", \"estável\") " +
          "com o tom que a tela decide: `positive` é melhora, `negative` é piora, " +
          "seja qual for o sinal — uma queda em \"Abaixo do esperado\" é melhora. " +
          "`tone=\"attention\"` destaca o cartão como ponto de atenção.\n\n" +
          "Moldura do Card (raio 12, respiro 24, sem sombra). O aval visual da PO " +
          "ainda está pendente.",
      },
    },
  },
} satisfies Meta<typeof StatCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: rótulo, valor e nota. */
export const Padrao: Story = {};

/** Com ícone ao lado do rótulo. */
export const ComIcone: Story = { args: { icon: <Users className="h-4 w-4" /> } };

/** Variação favorável — o sinal não importa, o tom é que diz se melhorou. */
export const VariacaoPositiva: Story = {
  args: {
    label: "Média geral",
    value: "4,1",
    note: "escala 1–5 · ponderada pelos pesos",
    icon: <TrendingUp className="h-4 w-4" />,
    delta: { value: "+0,2", tone: "positive" },
  },
};

/** Variação desfavorável. */
export const VariacaoNegativa: Story = {
  args: { label: "Participação", value: "61%", delta: { value: "−3 p.p.", tone: "negative" } },
};

/** Sem variação relevante. */
export const VariacaoNeutra: Story = {
  args: { label: "Participação", value: "68%", delta: { value: "estável", tone: "neutral" } },
};

/** Ponto de atenção: o cartão inteiro se destaca, e a nota ganha o tom de aviso. */
export const Atencao: Story = {
  args: {
    label: "Pendências",
    value: "12",
    note: "Sem nenhuma etapa iniciada",
    icon: <AlertTriangle className="h-4 w-4" />,
    tone: "attention",
  },
};

/** Atenção com variação — em "Abaixo do esperado", queda conta como melhora. */
export const AtencaoComVariacao: Story = {
  args: {
    label: "Abaixo do esperado",
    value: "9%",
    note: "6 pessoas · atenção do RH",
    tone: "attention",
    delta: { value: "−2 p.p.", tone: "positive" },
  },
};

/** Valor com texto, não número. */
export const ValorEmTexto: Story = {
  args: {
    label: "Ciclo ativo",
    value: "2026.2",
    note: "Encerra em 30/10 · 23 dias",
    icon: <CalendarClock className="h-4 w-4" />,
  },
};

/** Carregando: o valor é conteúdo livre, então o esqueleto entra no lugar dele. */
export const Carregando: Story = {
  args: { value: <Skeleton className="h-8 w-16" />, note: <Skeleton className="h-4 w-28" /> },
};

/** Sem dado ainda: um travessão, e a nota explica por quê. */
export const SemDado: Story = {
  args: { label: "Média geral", value: "—", note: "Nenhum ciclo encerrado" },
};

/** Em grade, como no topo de uma tela. */
export const EmGrade: Story = {
  args: { className: undefined },
  render: () => (
    <div className="grid w-[1080px] grid-cols-4 gap-4">
      <StatCard label="Ciclo ativo" value="2026.2" note="Encerra em 30/10 · 23 dias" icon={<CalendarClock className="h-4 w-4" />} />
      <StatCard label="Participação" value="68%" note="41 de 60 iniciaram" icon={<Users className="h-4 w-4" />} delta={{ value: "+5 p.p.", tone: "positive" }} />
      <StatCard label="Pendências" value="12" note="Sem nenhuma etapa iniciada" icon={<AlertTriangle className="h-4 w-4" />} tone="attention" />
      <StatCard label="Média geral" value="4,1" note="escala 1–5 · +0,2 vs. 2026.1" icon={<TrendingUp className="h-4 w-4" />} delta={{ value: "estável", tone: "neutral" }} />
    </div>
  ),
};
