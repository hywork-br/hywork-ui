import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingScale, type RatingScaleProps } from "./index";

const concordancia = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
const tresNiveis = ["Abaixo do esperado", "Dentro do esperado", "Acima do esperado"];

/** A story guarda o valor só para demonstrar; na tela, quem guarda é o formulário. */
function Controlado(props: RatingScaleProps) {
  const [valor, setValor] = React.useState(props.value);
  React.useEffect(() => setValor(props.value), [props.value]);
  return (
    <div className="w-full max-w-2xl space-y-3">
      <RatingScale {...props} value={valor} onChange={setValor} />
      <p className="text-xs text-muted-foreground">
        Valor: <code>{valor === null ? "null" : valor}</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Core/RatingScale",
  component: RatingScale,
  args: {
    name: "nota",
    value: null,
    onChange: () => undefined,
    labels: concordancia,
    "aria-label": "A comunicação da equipe é clara",
  },
  render: (args) => <Controlado {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Escala de resposta de 1 a N, com um rótulo por nota. O tamanho de " +
          "`labels` define a escala (sem rótulos, 5 notas).\n\n" +
          "É um grupo de rádio: uma nota por vez, e o Tab entra e sai do grupo " +
          "numa parada só. Setas mudam **e marcam** a nota, Home e End vão à " +
          "primeira e à última; Espaço marca a nota em foco. `readOnly` mostra a " +
          "nota e continua focável, sem mudar; `disabled` sai da ordem do Tab.\n\n" +
          "`compareValue` marca, com um ponto discreto, um segundo valor de " +
          "referência — a tela diz o que ele é. Ele não é uma escolha.\n\n" +
          "Abaixo de 640px os rótulos saem dos botões e a legenda mostra os dois " +
          "extremos; o leitor de tela ouve sempre a nota com o rótulo. " +
          "O aval visual da PO ainda está pendente.",
      },
    },
  },
} satisfies Meta<typeof RatingScale>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Vazio, à espera da nota. O Tab entra pela primeira. */
export const Vazio: Story = {};

/** Com uma nota escolhida. */
export const Selecionado: Story = { args: { value: 4 } };

/** O rótulo da nota escolhida também aparece embaixo, por extenso. */
export const ComRotuloDaEscolhida: Story = { args: { value: 4, showSelectedLabel: true } };

/**
 * Um segundo valor como referência, com um ponto discreto: aqui a nota 2 é
 * a referência e a 4 é a escolha. A referência não é selecionável por si — a
 * tela explica o que ela é, ao lado da escala.
 */
export const ComReferencia: Story = {
  args: { value: 4, compareValue: 2, showSelectedLabel: true },
  render: (args) => (
    <div className="w-full max-w-2xl space-y-2">
      <Controlado {...args} />
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-muted-foreground" />
        Referência: nota 2
      </p>
    </div>
  ),
};

/** A referência e a escolha na mesma nota: o ponto continua visível sobre a escolha. */
export const ReferenciaIgualAEscolha: Story = { args: { value: 3, compareValue: 3 } };

/** Só leitura: mostra a nota, continua focável, e nada muda. */
export const SomenteLeitura: Story = {
  args: { value: 4, readOnly: true, showSelectedLabel: true, compareValue: 3 },
};

/** Indisponível — fora da ordem do Tab. */
export const Desabilitado: Story = { args: { value: 2, disabled: true } };

/** Erro vindo do formulário, ligado ao grupo por `aria-describedby`. */
export const ComErro: Story = { args: { error: "Escolha uma nota." } };

/** Três rótulos, três notas. */
export const EscalaDeTres: Story = {
  args: { labels: tresNiveis, value: 2, showSelectedLabel: true, "aria-label": "Entrega no prazo" },
};

/** Cinco rótulos, cinco notas — a escala mais comum. */
export const EscalaDeCinco: Story = { args: { value: 3, showSelectedLabel: true } };

/** Sem rótulos: cinco notas, só números. */
export const SemRotulos: Story = { args: { labels: [], value: 3 } };

/** Várias perguntas seguidas, cada uma com a sua escala e uma parada de Tab. */
export const Formulario: Story = {
  render: () => {
    const perguntas = ["Comunica-se com clareza", "Cumpre os prazos combinados", "Colabora com a equipe"];
    const [notas, setNotas] = React.useState<(number | null)[]>([4, null, 2]);
    return (
      <div className="w-full max-w-2xl space-y-6">
        {perguntas.map((pergunta, i) => (
          <div key={pergunta} className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{pergunta}</p>
            <RatingScale
              name={`q${i}`}
              aria-label={pergunta}
              labels={concordancia}
              value={notas[i]}
              onChange={(nota) => setNotas((atual) => atual.map((n, j) => (j === i ? nota : n)))}
              error={notas[i] === null ? "Escolha uma nota." : undefined}
            />
          </div>
        ))}
      </div>
    );
  },
};
