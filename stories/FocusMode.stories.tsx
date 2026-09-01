import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FocusMode,
  Input,
  Label,
  Stepper,
} from "../src";

const meta = {
  parameters: { layout: "fullscreen" },
  title: "Patterns/Modo foco",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const stepOrder = ["channel", "audience", "content", "review"] as const;

function FocusModeExample() {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<(typeof stepOrder)[number]>("audience");
  const currentIndex = stepOrder.indexOf(currentStep);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Reabrir criação de campanha</Button>;
  }

  return (
    <FocusMode
      description="O contexto da lista permanece preservado ao sair."
      onExit={() => setOpen(false)}
      open={open}
      title="Criar campanha"
    >
      <div className="hw-flow">
        <Stepper
          currentStep={currentStep}
          onStepChange={(id) => setCurrentStep(id as (typeof stepOrder)[number])}
          steps={stepOrder.map((id, index) => ({
            id,
            label: ["Canal", "Público", "Conteúdo", "Revisão"][index],
            status: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
          }))}
        />
        <Card>
          <CardHeader>
            <CardTitle>Quem deve receber?</CardTitle>
            <CardDescription>Combine estrutura e atributos sem perder a leitura do alcance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hw-flow__grid">
              <Field>
                <Label htmlFor="flow-unit">Unidade</Label>
                <Input id="flow-unit" value="Todas as unidades" readOnly />
              </Field>
              <Field>
                <Label htmlFor="flow-area">Área</Label>
                <Input id="flow-area" value="Pessoas & Cultura" readOnly />
              </Field>
            </div>
            <aside className="hw-flow__summary">
              <p>Alcance estimado</p>
              <strong>1.248 pessoas</strong>
              <span>6 unidades · 14 áreas</span>
            </aside>
          </CardContent>
        </Card>
        <footer className="hw-flow__actions">
          <Button onClick={() => setCurrentStep("channel")} variant="quiet">Voltar</Button>
          <Button onClick={() => setCurrentStep("content")}>Continuar para conteúdo</Button>
        </footer>
      </div>
    </FocusMode>
  );
}

export const CriacaoDeCampanha: Story = {
  render: () => <FocusModeExample />,
};
