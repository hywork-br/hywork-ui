/**
 * Contratos comuns aos gráficos de `@hywork/ui/charts`.
 *
 * O gráfico não sabe o que é um ciclo, um colaborador ou uma competência: ele
 * recebe séries, categorias e valores **já arredondados**, e devolve o `id` da
 * categoria escolhida. Toda frase vem pronta da tela ("12 pessoas",
 * "poucos dados", "Parcial").
 */

/** Uma das cinco cores de gráfico do design system (`--chart-1..5`). Nunca uma cor literal. */
export type ChartColor = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

/** Formata um número para exibição. O padrão é `Intl.NumberFormat("pt-BR")`. */
export type ChartValueFormatter = (value: number) => string;

/** Uma série: uma cor e um nome na legenda — "Líder", "Autoavaliação". */
export interface ChartSeries {
  id: string;
  label: string;
  /** Cor da série. Na falta, a ordem fixa do design system pela posição na lista. */
  color?: ChartColor;
}

/** Uma categoria: um eixo do radar, um grupo de barras. */
export interface ChartCategory {
  id: string;
  label: string;
  /** Valor de cada série, pelo `id` da série. `null` ou ausente: sem valor ("—"). */
  values: Record<string, number | null | undefined>;
  /** Linha de apoio sob o rótulo — "12 pessoas". Já formatada. */
  note?: string;
  /** Marcador da categoria — "poucos dados". Aparece junto da nota, na dica e na tabela. */
  flag?: string;
}
