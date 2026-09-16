import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Stepper } from "../src";

const meta = { title: "Patterns/Stepper", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const labels = [
  "Escolha",
  "Informações básicas",
  "Estrutura",
  "Regras",
  "Certificado e reconhecimento de conclusão",
];

function Steps({ width }: { width?: string }) {
  const [current, setCurrent] = useState("3");
  return <div style={width ? { maxWidth: width } : undefined}>
    <Stepper currentStep={current} onStepChange={setCurrent} steps={
      labels.map((label, index) => ({ id: String(index + 1), label, status: index + 1 < Number(current) ? "complete" : index + 1 === Number(current) ? "current" : "upcoming" }))} />
    <p role="status">Etapa selecionada: {current}</p>
  </div>;
}

/** O contêiner do formulário: 672px em qualquer viewport. É onde o trilho quebrava. */
export const Constrained: Story = { render: () => <Steps width="42rem" /> };

/** Sem teto de largura: o mesmo trilho, em modo completo, quando o contêiner comporta os nomes. */
export const FullWidth: Story = { render: () => <Steps /> };
