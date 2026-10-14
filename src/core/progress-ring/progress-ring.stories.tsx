import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressRing } from "./index";

const meta = {
  title: "Core/ProgressRing",
  component: ProgressRing,
  args: { value: 68, "aria-label": "Participação" },
  parameters: {
    docs: {
      description: {
        component:
          "Anel de progresso: o `Progress` em forma de anel, para um espaço quadrado — " +
          "ao lado de um título, dentro de um card, no topo de um resultado.\n\n" +
          "`value` é limitado a `[0, max]` (`max` padrão 100; zero deixa o anel vazio). " +
          "O centro mostra a porcentagem arredondada ou o `label` da tela. Arco na tinta " +
          "da marca, trilha neutra. Tamanhos de 48, 72 e 96px.\n\n" +
          "Proposta para o DHO (HCK-255): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof ProgressRing>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Em curso, no tamanho padrão (72px). */
export const Padrao: Story = {};

/** Os três tamanhos: 48, 72 e 96px. */
export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <ProgressRing {...args} size="sm" aria-label="Pequeno" />
      <ProgressRing {...args} size="md" aria-label="Médio" />
      <ProgressRing {...args} size="lg" aria-label="Grande" />
    </div>
  ),
};

/**
 * Denominador próprio: 78 de 85 avaliações concluídas. O centro mostra a
 * porcentagem (92%); o leitor de tela ouve `aria-valuenow` 78 de 85.
 */
export const MaxProprio: Story = { args: { value: 78, max: 85, "aria-label": "Avaliações concluídas" } };

/**
 * Rótulo customizado. Quando é texto, o leitor de tela ouve o mesmo texto; com
 * conteúdo livre, ouve a porcentagem — ou o `aria-valuetext` que a tela passar.
 */
export const RotuloCustomizado: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing value={78} max={85} label="78/85" aria-label="Avaliações concluídas" />
      <ProgressRing
        value={4.1}
        max={5}
        size="lg"
        label={
          <span className="flex flex-col items-center gap-1">
            <span>4,1</span>
            <span className="text-xs font-normal text-muted-foreground">de 5</span>
          </span>
        }
        aria-label="Média geral"
        aria-valuetext="4,1 de 5"
      />
    </div>
  ),
};

/** Vazio: nada feito ainda. Sem arco, só a trilha. */
export const Vazio: Story = { args: { value: 0 } };

/** Concluído. */
export const Concluido: Story = { args: { value: 100 } };

/**
 * Fora do intervalo: o valor é limitado a `[0, max]`. Com `max` zero — um
 * ciclo sem público, por exemplo — o anel fica vazio, sem NaN.
 */
export const ForaDoIntervalo: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing value={140} aria-label="Acima do máximo" />
      <ProgressRing value={-10} aria-label="Abaixo de zero" />
      <ProgressRing value={3} max={0} aria-label="Sem denominador" />
    </div>
  ),
};

/** Ao lado do título, ligado a ele por `aria-labelledby`. */
export const ComTitulo: Story = {
  render: () => (
    <div className="flex w-[320px] items-center gap-4 rounded-lg border border-border bg-card p-6">
      <ProgressRing value={41} max={60} size="sm" aria-labelledby="ring-titulo" />
      <div className="min-w-0">
        <h3 id="ring-titulo" className="text-sm font-semibold text-hw-heading">
          Autoavaliação
        </h3>
        <p className="text-sm text-muted-foreground">41 de 60 concluíram</p>
      </div>
    </div>
  ),
};
