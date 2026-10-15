import type { ChartCategory, ChartSeries } from "./types";

/**
 * Dados de exemplo das stories, dos testes e da página de teste do navegador.
 * Os números do radar, dos pilares e da distribuição são os do exemplo da
 * HCK-256 (5 participantes, 4 no resultado). Não entram no pacote: nenhuma
 * entrada pública importa este arquivo. Sem os tipos dos componentes, de
 * propósito: os dados servem a todos eles sem criar dependência entre eles.
 */
export const leaderSelf: ChartSeries[] = [
  { id: "leader", label: "Líder" },
  { id: "self", label: "Autoavaliação" },
];

export const competencies: ChartCategory[] = [
  { id: "c1", label: "Comunicação", values: { leader: 3.3, self: 4.3 }, note: "4 pessoas" },
  { id: "c2", label: "Colaboração", values: { leader: 3.8, self: 3.8 }, note: "4 pessoas" },
  { id: "c3", label: "Entrega com qualidade", values: { leader: 3, self: 3.5 }, note: "4 pessoas" },
  { id: "c4", label: "Visão de negócio e de cliente", values: { leader: 3.6, self: 4 }, note: "4 pessoas" },
  { id: "c5", label: "Liderança de pessoas", values: { leader: 4.5, self: 4.5 }, note: "2 pessoas", flag: "poucos dados" },
  { id: "c6", label: "Inovação", values: { leader: 2.8, self: 3.4 }, note: "4 pessoas" },
];

export const pillars: ChartCategory[] = [
  { id: "p1", label: "Comportamento", values: { leader: 3.5, self: 4.1 }, note: "4 pessoas" },
  { id: "p2", label: "Resultado", values: { leader: 3, self: 3.5 }, note: "4 pessoas" },
];

export const cycles: ChartSeries[] = [
  { id: "current", label: "Ciclo 2026.1" },
  { id: "other", label: "Ciclo 2025.2" },
];

export const comparison: ChartCategory[] = [
  { id: "c1", label: "Comunicação", values: { current: 3.3, other: 3.1 }, note: "4 e 5 pessoas" },
  { id: "c2", label: "Colaboração", values: { current: 3.8, other: 3.9 }, note: "4 e 5 pessoas" },
  { id: "c3", label: "Entrega com qualidade", values: { current: 3, other: null }, note: "4 e 0 pessoas" },
];

export const evolution = [
  { id: "2024.1", label: "Ciclo 2024.1", value: 3.4, note: "38 pessoas" },
  { id: "2024.2", label: "Ciclo 2024.2", value: 3.5, note: "41 pessoas" },
  { id: "2025.1", label: "Ciclo 2025.1", value: 3.3, note: "40 pessoas", flag: "Modelos diferentes" },
  { id: "2025.2", label: "Ciclo 2025.2", value: 3.6, note: "44 pessoas" },
  { id: "2026.1", label: "Ciclo 2026.1", value: 3.8, note: "4 pessoas", provisional: "Provisório" },
];

export const bands = [
  { id: "below", label: "Abaixo do esperado", value: 25, note: "1 pessoa" },
  { id: "developing", label: "Em desenvolvimento", value: 25, note: "1 pessoa" },
  { id: "meets", label: "Dentro do esperado", value: 25, note: "1 pessoa" },
  { id: "exceeds", label: "Acima do esperado", value: 25, note: "1 pessoa" },
];

/** Depois da calibragem do exemplo (Elisa 2,3 → 2,8). */
export const calibratedBands = [
  { id: "below", label: "Abaixo do esperado", value: 0, note: "0 pessoas" },
  { id: "developing", label: "Em desenvolvimento", value: 50, note: "2 pessoas" },
  { id: "meets", label: "Dentro do esperado", value: 25, note: "1 pessoa" },
  { id: "exceeds", label: "Acima do esperado", value: 25, note: "1 pessoa" },
];

/** Nota com uma casa, sempre: "4,0", não "4". */
export const score = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Pessoas por área, como no bloco "Por estrutura organizacional" do protótipo da HCK-256. */
export const areas = [
  { id: "sales", label: "Comercial", value: 62 },
  { id: "tech", label: "Tecnologia", value: 48 },
  { id: "product", label: "Produto", value: 24 },
  { id: "support", label: "Suporte", value: 41 },
  { id: "operations", label: "Operações", value: 118 },
  { id: "finance", label: "Financeiro", value: 32 },
];
