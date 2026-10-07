import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper, type StepperStep } from "./index";

const passos: StepperStep[] = [
  { id: "informacoes", label: "Informações", state: "complete" },
  { id: "publico", label: "Público", state: "current" },
  { id: "modelo", label: "Modelo e competências", state: "upcoming" },
  { id: "revisao", label: "Revisão", state: "upcoming" },
  { id: "publicar", label: "Publicar", state: "upcoming" },
];

const meta = {
  title: "Platform/Padrões/Stepper",
  component: Stepper,
  args: { steps: passos },
  parameters: {
    docs: {
      description: {
        component:
          "Trilha de passos de um assistente (wizard).\n\n" +
          "Duas formas, a mesma lista de passos: **horizontal** é a trilha de " +
          "progresso — segmentos preenchidos até o passo atual, sem clique; " +
          "**vertical** é a navegação entre os passos — número em círculo, ✓ nos " +
          "concluídos, o atual destacado. O passo só é clicável quando a tela " +
          "passa `onSelect` e ele não está `locked`.\n\n" +
          "Referência de estrutura: protótipo da PO do wizard de ciclo. O aval " +
          "visual da PO ainda está pendente.",
      },
    },
  },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Trilha de progresso: segmentos preenchidos até o passo atual. */
export const Horizontal: Story = {
  args: { orientation: "horizontal", className: "w-[320px]" },
};

/** No último passo, a trilha inteira está preenchida. */
export const HorizontalNoFim: Story = {
  args: {
    orientation: "horizontal",
    className: "w-[320px]",
    steps: passos.map((p, i) => ({ ...p, state: i < 4 ? "complete" : "current" })),
  },
};

/** Navegação lateral, só leitura: sem `onSelect`, nenhum passo é clicável. */
export const Vertical: Story = {
  args: { orientation: "vertical", className: "w-[260px]" },
};

/**
 * Navegável: com `onSelect`, todo passo que não está `locked` vira botão.
 * Clique para mudar de passo — a story guarda o estado só para demonstrar.
 */
export const VerticalNavegavel: Story = {
  render: (args) => {
    const [atual, setAtual] = React.useState("publico");
    const indiceAtual = passos.findIndex((p) => p.id === atual);
    const steps = passos.map((p, i) => ({
      ...p,
      state: i === indiceAtual ? "current" : i < indiceAtual ? "complete" : "upcoming",
    })) as StepperStep[];
    return (
      <Stepper {...args} orientation="vertical" className="w-[260px]" steps={steps} onSelect={setAtual} />
    );
  },
};

/**
 * Passos bloqueados: visíveis, com cadeado, mas sem clique — `aria-disabled`
 * avisa o leitor de tela. Use quando o passo depende de um anterior.
 */
export const ComPassoBloqueado: Story = {
  args: {
    orientation: "vertical",
    className: "w-[260px]",
    onSelect: () => undefined,
    steps: [
      { id: "informacoes", label: "Informações", state: "complete" },
      { id: "publico", label: "Público", state: "current" },
      { id: "modelo", label: "Modelo e competências", state: "upcoming" },
      { id: "revisao", label: "Revisão", state: "locked" },
      { id: "publicar", label: "Publicar", state: "locked" },
    ],
  },
};

/** As duas formas juntas, como no wizard em tela cheia. */
export const ComposicaoDoWizard: Story = {
  render: (args) => (
    <div className="flex w-[640px] flex-col gap-6">
      <div className="flex items-center justify-between gap-6">
        <p className="text-sm text-muted-foreground">Passo 2 de 5 · público</p>
        <Stepper {...args} orientation="horizontal" className="w-[200px]" />
      </div>
      <Stepper {...args} orientation="vertical" className="w-[260px]" onSelect={() => undefined} />
    </div>
  ),
};
