import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingScale, type RatingScaleProps } from "./index";

const concordancia = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
const tresNiveis = ["Abaixo do esperado", "Dentro do esperado", "Acima do esperado"];
/** A escala de 1 a 10 do modelo de avaliação (HCK-235, M1). */
const dezNiveis = [
  "Muito abaixo do esperado",
  "Abaixo do esperado",
  "Em desenvolvimento",
  "Atende parcialmente",
  "Próximo do esperado",
  "Atende ao esperado",
  "Acima do esperado",
  "Supera as expectativas",
  "Excelente desempenho",
  "É referência",
];

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
          "extremos; o leitor de tela ouve sempre a nota com o rótulo.\n\n" +
          "`labelDisplay` decide onde fica o rótulo: `inline` (dentro de cada nota) " +
          "ou `selected` (as notas numa linha compacta, e embaixo o rótulo da nota sob " +
          "o cursor ou em foco, senão o da escolhida, senão os extremos). O padrão, " +
          "`auto`, é `inline` até 5 notas e `selected` acima — os 10 rótulos da escala " +
          "de 1 a 10 não cabem lado a lado. " +
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

/**
 * Escala de 1 a 10 (HCK-235, M1): com mais de 5 notas, `labelDisplay="auto"`
 * põe as notas numa linha compacta e o rótulo embaixo. Vazia e sem foco, a
 * linha de baixo mostra os dois extremos; passe o cursor ou use as setas.
 */
export const EscalaDeDez: Story = {
  args: { labels: dezNiveis, "aria-label": "Entrega e execução" },
};

/** Escala de 1 a 10 com uma nota escolhida: o rótulo dela fica embaixo. */
export const EscalaDeDezEscolhida: Story = {
  args: { labels: dezNiveis, value: 6, "aria-label": "Entrega e execução" },
};

/** Escala de 1 a 10 com a referência (a autoavaliação, por exemplo) num ponto discreto. */
export const EscalaDeDezComReferencia: Story = {
  args: { labels: dezNiveis, value: 8, compareValue: 6, "aria-label": "Entrega e execução" },
};

/** Só leitura, na escala de 10: as setas passeiam e o rótulo embaixo acompanha o foco. */
export const EscalaDeDezSomenteLeitura: Story = {
  args: { labels: dezNiveis, value: 7, readOnly: true, compareValue: 5, "aria-label": "Entrega e execução" },
};

/** Escala de 10 desabilitada. */
export const EscalaDeDezDesabilitada: Story = {
  args: { labels: dezNiveis, value: 3, disabled: true, "aria-label": "Entrega e execução" },
};

/** Escala de 10 com erro do formulário. */
export const EscalaDeDezComErro: Story = {
  args: { labels: dezNiveis, error: "Escolha uma nota.", "aria-label": "Entrega e execução" },
};

/** Escala de 10 em 360px: as dez notas cabem numa linha, sem rolagem horizontal, com 44px de altura. */
export const EscalaDeDezEstreita: Story = {
  args: { labels: dezNiveis, value: 9, "aria-label": "Entrega e execução" },
  render: (args) => (
    <div className="w-[328px]">
      <Controlado {...args} />
    </div>
  ),
};

/** `labelDisplay="selected"` também vale para 5 notas, quando a tela quer a linha compacta. */
export const CincoComRotuloEmbaixo: Story = {
  args: { value: 4, labelDisplay: "selected" },
};
