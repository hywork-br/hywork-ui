import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  FocusMode,
  Input,
  Label,
  Stepper,
  Textarea,
} from "../src";
import "./pilots/pilots.css";

const meta = {
  parameters: { layout: "fullscreen" },
  title: "Patterns/Modo foco",
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const steps = ["Canal", "Público", "Conteúdo", "Revisão"];

function FocusModeExample() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState("Intranet");
  const [audience, setAudience] = useState("Todas as equipes");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [step, open]);
  const nextLabels = [
    "Continuar para público",
    "Continuar para conteúdo",
    "Revisar campanha",
    "Salvar rascunho local",
  ];
  const headings = [
    "Escolha o canal",
    "Quem deve receber?",
    "Escreva sua mensagem",
    "Revise seu rascunho",
  ];
  return (
    <div className="hw-reference-pilot">
      <Button
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
      >
        Criar campanha
      </Button>
      <p role="status">{notice}</p>
      <p>
        Exemplo local de sequência. Nada será enviado. Fechar preserva o
        rascunho enquanto esta página estiver aberta.
      </p>
      <FocusMode
        description="Demonstração local · nenhum envio será realizado"
        onExit={() => setOpen(false)}
        open={open}
        title="Criar campanha"
      >
        <form
          className="hw-flow"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 3) setStep(step + 1);
            else {
              setNotice(
                "Rascunho salvo nesta demonstração. Nenhuma campanha foi enviada."
              );
              setOpen(false);
            }
          }}
        >
          <Stepper
            currentStep={String(step)}
            onStepChange={(id) => setStep(Number(id))}
            steps={steps.map((label, index) => ({
              id: String(index),
              label,
              status:
                index < step
                  ? "complete"
                  : index === step
                  ? "current"
                  : "upcoming",
            }))}
          />
          <Card>
            <CardHeader>
              <CardTitle ref={headingRef} tabIndex={-1}>
                {headings[step]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 0 && (
                <Field>
                  <Label htmlFor="campaign-channel">Canal</Label>
                  <select
                    className="hw-select"
                    id="campaign-channel"
                    onChange={(event) => setChannel(event.target.value)}
                    value={channel}
                  >
                    <option>Intranet</option>
                    <option>E-mail</option>
                    <option>TV Corporativa</option>
                  </select>
                </Field>
              )}
              {step === 1 && (
                <Field>
                  <Label htmlFor="campaign-audience">Público</Label>
                  <select
                    className="hw-select"
                    id="campaign-audience"
                    onChange={(event) => setAudience(event.target.value)}
                    value={audience}
                  >
                    <option>Todas as equipes</option>
                    <option>Lideranças</option>
                    <option>Operações</option>
                  </select>
                </Field>
              )}
              {step === 2 && (
                <div className="hw-reference-editor__content">
                  <Field>
                    <Label htmlFor="campaign-title">Título da campanha</Label>
                    <Input
                      id="campaign-title"
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      value={title}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="campaign-message">Mensagem</Label>
                    <Textarea
                      id="campaign-message"
                      onChange={(event) => setMessage(event.target.value)}
                      required
                      value={message}
                    />
                  </Field>
                </div>
              )}
              {step === 3 && (
                <section>
                  <p>
                    {channel} · {audience}
                  </p>
                  <h3>{title}</h3>
                  <p>{message}</p>
                  <p>
                    Ao salvar, o rascunho permanece nesta demonstração. Não há
                    publicação ou disparo.
                  </p>
                </section>
              )}
            </CardContent>
          </Card>
          <footer className="hw-flow__actions">
            <Button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              type="button"
              variant="outline"
            >
              Voltar
            </Button>
            <Button type="submit">{nextLabels[step]}</Button>
          </footer>
        </form>
      </FocusMode>
    </div>
  );
}
export const CriacaoDeCampanha: Story = { render: () => <FocusModeExample /> };
