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
  FileUpload,
  Input,
  Label,
  Select,
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
  const announcedStep = useRef(0);
  /* Mover o foco a cada passo é do fluxo; ao ABRIR quem decide é o padrão, que
     leva o foco ao primeiro campo do corpo (R29). */
  useEffect(() => {
    if (!open || announcedStep.current === step) return;
    announcedStep.current = step;
    headingRef.current?.focus();
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
          announcedStep.current = 0;
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
        actions={
          <Button form="focus-campaign-form" type="submit">
            {nextLabels[step]}
          </Button>
        }
        back={
          <Button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            type="button"
            variant="outline"
          >
            Voltar
          </Button>
        }
        description="Demonstração local · nenhum envio será realizado"
        onExit={() => setOpen(false)}
        open={open}
        title="Criar campanha"
      >
        <form
          className="hw-flow"
          id="focus-campaign-form"
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
          {/* A medida de leitura vale para os campos; o trilho fica com a
              largura do modo de foco. */}
          <div className="hw-focus-mode__content">
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
          </div>
        </form>
      </FocusMode>
    </div>
  );
}
export const CriacaoDeCampanha: Story = { render: () => <FocusModeExample /> };

function LongContentExample() {
  const [open, setOpen] = useState(false);
  return (
    <div data-surface="portal">
      <Button onClick={() => setOpen(true)}>Abrir conteúdo longo</Button>
      <FocusMode
        description="Título dinâmico sem espaços; controles e leitura permanecem disponíveis no celular."
        onExit={() => setOpen(false)}
        open={open}
        title={"A".repeat(160)}
      >
        <p>{"Conteudo".repeat(50)}</p>
        <FileUpload
          items={[
            {
              id: "local",
              name: `${"Documento".repeat(30)}.pdf`,
              progress: 100,
              status: "complete",
            },
          ]}
          label="Arquivo local"
          onFilesChange={() => undefined}
        />
        <Button onClick={() => setOpen(false)}>Concluir leitura</Button>
      </FocusMode>
    </div>
  );
}
export const LongContent: Story = { render: () => <LongContentExample /> };

/* Entrega Select → modo de foco. O Radix põe `pointer-events: none` no `body`
   enquanto um Select está aberto e devolve ao fechar; se o diálogo montar nos
   frames entre uma coisa e outra, o conteúdo herda o bloqueio e o clique se
   perde — `elementsFromPoint` responde o overlay no lugar do controle. A story
   existe para essa sequência ser clicável por teste, e não só descrita. */
function SelectHandoffExample() {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("intranet");
  const [confirmed, setConfirmed] = useState(0);
  return (
    <div className="hw-reference-pilot">
      <Field>
        <Label htmlFor="handoff-channel">Canal</Label>
        <Select
          ariaLabel="Canal"
          id="handoff-channel"
          onValueChange={setChannel}
          options={[
            { label: "Intranet", value: "intranet" },
            { label: "E-mail", value: "email" },
            { label: "TV corporativa", value: "tv" },
          ]}
          value={channel}
        />
      </Field>
      <Button onClick={() => setOpen(true)}>Abrir modo de foco</Button>
      <FocusMode
        actions={
          <Button onClick={() => setConfirmed((total) => total + 1)}>Confirmar canal</Button>
        }
        back={<Button onClick={() => setOpen(false)} variant="outline">Voltar</Button>}
        measure="form"
        onExit={() => setOpen(false)}
        open={open}
        title="Entrega do Select para o modo de foco"
      >
        <Field>
          <Label htmlFor="handoff-note">Observação</Label>
          <Input id="handoff-note" />
        </Field>
        <p>Canal escolhido antes de entrar: {channel}.</p>
        {/* Dentro do diálogo: um modal esconde o resto da página da árvore
            acessível, e um contador fora dele não teria como ser lido. */}
        <p role="status">Confirmações registradas: {confirmed}</p>
      </FocusMode>
    </div>
  );
}
export const SelectHandoff: Story = { render: () => <SelectHandoffExample /> };
