import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./index";

const meta = {
  title: "Core/Progress",
  component: Progress,
  args: { className: "w-[360px]", "aria-label": "Progresso" },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Começo. */
export const Inicio: Story = { args: { value: 0 } };

/** Em curso. */
export const EmCurso: Story = { args: { value: 45 } };

/** Concluído. */
export const Concluido: Story = { args: { value: 100 } };

/**
 * Com o número ao lado.
 *
 * Use quando dá para saber quanto falta. Quando não dá — uma chamada sem
 * progresso —, o certo é o `Skeleton`.
 *
 * O `value` chega ao leitor de tela como `aria-valuenow` (desde a correção do
 * HCK-255). Quando o texto ao lado diz mais que a porcentagem, passe-o em
 * `aria-valuetext`.
 */
export const ComRotulo: Story = {
  render: () => (
    <div className="w-[360px] space-y-2">
      <div className="flex justify-between text-sm">
        <span id="progress-import-label">Importando colaboradores</span>
        <span className="text-muted-foreground">82 de 140</span>
      </div>
      <Progress value={58} aria-labelledby="progress-import-label" aria-valuetext="82 de 140" />
    </div>
  ),
};

/**
 * Com marca de referência: uma linha fina, mais alta que a barra, num segundo
 * valor — aqui, a nota final em 84% e a autoavaliação em 72%. A marca é
 * desenho; o leitor de tela ouve o `markerLabel` na descrição da barra.
 */
export const ComMarca: Story = {
  args: { value: 84, marker: 72, markerLabel: "Autoavaliação: 72%", "aria-label": "Nota final" },
};

/** Atenção: o preenchimento e a trilha na cor de aviso. */
export const Atencao: Story = { args: { value: 38, tone: "attention", "aria-label": "Comunicação" } };

/** Atenção com marca: abaixo da referência. */
export const AtencaoComMarca: Story = {
  args: { value: 38, tone: "attention", marker: 64, markerLabel: "Autoavaliação: 64%", "aria-label": "Comunicação" },
};

/** A marca nas pontas: 0% e 100% ficam dentro da caixa, meio traço para fora. */
export const MarcaNasPontas: Story = {
  render: () => (
    <div className="w-[360px] space-y-4">
      <Progress value={40} marker={0} aria-label="Marca no começo" />
      <Progress value={40} marker={100} aria-label="Marca no fim" />
    </div>
  ),
};

/**
 * Por competência (HCK-259, L6): a barra mostra a nota final da competência
 * e a marca mostra a autoavaliação. A competência abaixo do esperado fica em
 * atenção.
 */
export const PorCompetencia: Story = {
  render: () => {
    const linhas = [
      { nome: "Entrega e execução", nota: 4.3, auto: 4.0 },
      { nome: "Colaboração", nota: 4.1, auto: 4.4 },
      { nome: "Comunicação", nota: 2.6, auto: 3.5, atencao: true },
      { nome: "Desenvolvimento de pessoas", nota: 3.4, auto: 3.2 },
    ];
    const n = (v: number) => v.toFixed(1).replace(".", ",");
    return (
      <div className="w-[420px] divide-y divide-border">
        {linhas.map((linha) => (
          <div key={linha.nome} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">{linha.nome}</p>
              <Progress
                aria-label={linha.nome}
                aria-valuetext={`${n(linha.nota)} de 5,0`}
                value={(linha.nota / 5) * 100}
                marker={(linha.auto / 5) * 100}
                markerLabel={`Autoavaliação: ${n(linha.auto)}`}
                tone={linha.atencao ? "attention" : "default"}
                className="max-w-[260px]"
              />
            </div>
            <span className="w-10 text-right text-sm font-bold tabular-nums text-foreground">{n(linha.nota)}</span>
          </div>
        ))}
        <p className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-3.5 w-0.5 rounded-full bg-foreground" />
          Autoavaliação
        </p>
      </div>
    );
  },
};
