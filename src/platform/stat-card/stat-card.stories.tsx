import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertTriangle,
  Award,
  CalendarClock,
  CircleCheck,
  Scale,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
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
          "`tone=\"attention\"` destaca o cartão como ponto de atenção; " +
          "`tone=\"highlight\"` é o cartão escuro de destaque (a nota final), com o " +
          "par tinta do texto / superfície, que se inverte sozinho no tema escuro.\n\n" +
          "`iconTone` pinta o quadradinho do ícone com um papel de estado (fundo suave e " +
          "traço; preenchido, no destaque). `valueDetail` é o texto menor ao lado do " +
          "valor (\"4,2 / 5,0\"), e `progress` (0–100) a barra fina sob ele — desenho, " +
          "porque o número já está no valor.\n\n" +
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

/** `iconTone`: cada papel de estado no quadradinho do ícone — fundo suave e traço. */
export const TonsDoIcone: Story = {
  args: { className: undefined },
  render: () => (
    <div className="grid w-[820px] grid-cols-3 gap-4">
      <StatCard label="Primária" value="12" icon={<Star className="h-4 w-4" />} iconTone="primary" note="o padrão, sem a prop" />
      <StatCard label="Informação" value="82%" icon={<Users className="h-4 w-4" />} iconTone="info" note="9 de 11 responderam" />
      <StatCard label="Sucesso" value="3" icon={<TrendingUp className="h-4 w-4" />} iconTone="success" note="acima do esperado" />
      <StatCard label="Aviso" value="2" icon={<AlertTriangle className="h-4 w-4" />} iconTone="warning" note="sugerem PDI imediato" />
      <StatCard label="Perigo" value="1" icon={<TrendingDown className="h-4 w-4" />} iconTone="danger" note="muito abaixo do esperado" />
      <StatCard label="Neutro" value="5" icon={<CalendarClock className="h-4 w-4" />} iconTone="neutral" note="sem resposta ainda" />
    </div>
  ),
};

/**
 * Destaque: o cartão escuro da nota final, com o percentual, o detalhe ao
 * lado ("4,2 / 5,0") e a barra. Fundo na tinta do texto, valor na cor da
 * superfície; no tema escuro, o par se inverte.
 */
export const Destaque: Story = {
  args: {
    label: "Nota do colaborador",
    value: "84%",
    valueDetail: "4,2 / 5,0",
    progress: 84,
    note: "Média ponderada 4,2 ÷ 5,0 (nota máxima)",
    tone: "highlight",
  },
};

/** Destaque com ícone e variação: o papel preenche o quadradinho e o selo. */
export const DestaqueComIconeEVariacao: Story = {
  args: {
    label: "Nota final",
    value: "84%",
    valueDetail: "4,2 / 5,0",
    progress: 84,
    note: "vs. ciclo anterior",
    tone: "highlight",
    icon: <Award className="h-4 w-4" />,
    iconTone: "success",
    delta: { value: "+0,3", tone: "positive" },
  },
};

/** Detalhe e barra num cartão claro. */
export const ComDetalheEBarra: Story = {
  args: {
    label: "Participação",
    value: "82%",
    valueDetail: "9 de 11",
    progress: 82,
    note: "responderam até agora",
    icon: <Users className="h-4 w-4" />,
    iconTone: "info",
  },
};

/** Em atenção, a barra fica na cor de aviso. */
export const AtencaoComBarra: Story = {
  args: {
    label: "Abaixo do esperado",
    value: "18%",
    valueDetail: "2 de 11",
    progress: 18,
    note: "Sugerem PDI imediato",
    tone: "attention",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

/** Cartão estreito: o detalhe desce para a linha de baixo em vez de estourar o cartão. */
export const DetalheQuebrando: Story = {
  args: {
    className: "w-[180px]",
    label: "Nota final",
    value: "84%",
    valueDetail: "4,2 de 5,0 pontos",
    progress: 84,
    tone: "highlight",
  },
};

/**
 * Resultado individual (HCK-259, L5): o destaque da nota final ao lado dos
 * contadores, cada um com o seu ícone colorido.
 */
export const ResultadoIndividual: Story = {
  args: { className: undefined },
  render: () => (
    <div className="grid w-[1080px] grid-cols-4 gap-4">
      <StatCard
        label="Nota do colaborador"
        value="84%"
        valueDetail="4,2 / 5,0"
        progress={84}
        note="Média ponderada 4,2 ÷ 5,0"
        tone="highlight"
      />
      <StatCard label="Nota do líder" value="4,3" note="Média sem autoavaliação" icon={<UserCheck className="h-4 w-4" />} iconTone="info" />
      <StatCard label="Autoavaliação" value="4,1" note="−0,2 em relação à nota do líder" icon={<Scale className="h-4 w-4" />} iconTone="primary" />
      <StatCard label="Faixa" value="Dentro" note="Escala 1 a 5" icon={<CircleCheck className="h-4 w-4" />} iconTone="success" />
    </div>
  ),
};

/** Resultado do ciclo (HCK-255, C1): um ícone colorido por contador. */
export const ResultadoDoCiclo: Story = {
  args: { className: undefined },
  render: () => (
    <div className="grid w-[1080px] grid-cols-4 gap-4">
      <StatCard label="Média do time" value="3,8" note="empresa 3,7 · +0,1" icon={<TrendingUp className="h-4 w-4" />} iconTone="primary" />
      <StatCard label="Participação" value="82%" valueDetail="9 de 11" progress={82} note="responderam" icon={<Users className="h-4 w-4" />} iconTone="info" />
      <StatCard label="Acima do esperado" value="3" note="27% do time" icon={<Award className="h-4 w-4" />} iconTone="success" />
      <StatCard label="Abaixo do esperado" value="2" note="Sugerem PDI imediato" icon={<AlertTriangle className="h-4 w-4" />} tone="attention" />
    </div>
  ),
};

/**
 * Fileira estreita (226px por cartão, como em 1280px com o menu aberto): ao
 * lado do ícone, "Acima do esperado" e "Abaixo do esperado" quebram em duas
 * linhas. Com ícone, o cabeçalho tem sempre a altura de duas linhas do rótulo,
 * e o valor começa na mesma altura nos quatro cartões. O rótulo não é cortado.
 */
export const FileiraEstreita: Story = {
  args: { className: undefined },
  render: () => (
    <div className="grid w-[952px] grid-cols-4 gap-4">
      <StatCard label="Média geral" value="3,8" note="empresa 3,7" icon={<TrendingUp className="h-4 w-4" />} iconTone="primary" />
      <StatCard label="Participação" value="82%" valueDetail="9 de 11" progress={82} note="responderam" icon={<Users className="h-4 w-4" />} iconTone="info" />
      <StatCard label="Acima do esperado" value="3" note="27% do time" icon={<Award className="h-4 w-4" />} iconTone="success" />
      <StatCard label="Abaixo do esperado" value="2" note="Sugerem PDI imediato" icon={<AlertTriangle className="h-4 w-4" />} tone="attention" />
    </div>
  ),
};
