import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Stepper } from "../src";

const meta = { title: "Patterns/Stepper", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ConstrainedSteps() {
  const [current, setCurrent] = useState("3");
  return <div style={{ maxWidth: "42rem" }}>
    <Stepper currentStep={current} onStepChange={setCurrent} steps={[
      "Escolha", "Informações básicas", "Estrutura", "Regras", "Certificado e reconhecimento de conclusão",
    ].map((label, index) => ({ id: String(index + 1), label, status: index + 1 < Number(current) ? "complete" : index + 1 === Number(current) ? "current" : "upcoming" }))} />
    <p role="status">Etapa selecionada: {current}</p>
  </div>;
}

export const Constrained: Story = { render: () => <ConstrainedSteps /> };
