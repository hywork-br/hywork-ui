import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layers, PlayCircle } from "lucide-react";
import { Badge } from "../../core/badge";
import { Label } from "../../core/label";
import { RadioGroup } from "../../core/radio-group";
import { ChoiceCard } from "./index";

const meta = {
  title: "Platform/Padrões/ChoiceCard",
  component: ChoiceCard,
  args: { value: "a", title: "Opção" },
  parameters: {
    docs: {
      description: {
        component:
          "Cartão de escolha: uma opção de `RadioGroup` com título, descrição e, se preciso, " +
          "uma linha extra (`meta`), um texto à direita (`aside`) e um ícone.\n\n" +
          "O cartão inteiro é o alvo do clique; o teclado é o do `RadioGroup` (Tab entra no " +
          "grupo, as setas mudam e marcam). Selecionado, desabilitado e foco saem do próprio " +
          "rádio, por CSS: a tela não passa `isSelected`.\n\n" +
          "**Proposta (HCK-390, 11/11/2026), aguardando o aval visual da PO.** A forma é a " +
          "mais comum no admin: a dos cartões do assistente de ciclo do DHO.",
      },
    },
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof ChoiceCard>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Dois cartões lado a lado, nenhum marcado no início: a forma do assistente de ciclo. */
export const Padrao: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label id="origem">De onde vem o quiz?</Label>
      <RadioGroup aria-labelledby="origem" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChoiceCard
          value="new"
          title="Criar um quiz novo"
          description="Comece do zero. O quiz já nasce vinculado a este módulo e você monta as perguntas no editor."
        />
        <ChoiceCard
          value="library"
          title="Usar um quiz da biblioteca"
          description="Escolha um quiz já criado na aba Quizzes & Avaliações. Ele pode estar em outras trilhas também."
        />
      </RadioGroup>
    </div>
  ),
};

/** Marcado: borda na tinta da marca e fundo da marca a 5%. */
export const Selecionado: Story = {
  render: () => (
    <RadioGroup defaultValue="library" aria-label="Origem" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ChoiceCard value="new" title="Criar um quiz novo" description="Comece do zero." />
      <ChoiceCard value="library" title="Usar um quiz da biblioteca" description="Escolha um quiz já criado." />
    </RadioGroup>
  ),
};

/**
 * Lista com texto à direita (`aside`), em uma coluna. O rascunho fica desabilitado
 * e a descrição diz por quê.
 */
export const ListaComLateral: Story = {
  render: () => (
    <RadioGroup defaultValue="q1" aria-label="Escolher quiz" className="flex flex-col gap-2">
      <ChoiceCard
        value="q1"
        title="Quiz: Conhecendo o HyWork"
        description="8 perguntas · nota mínima 70% · 3 tentativas"
        aside="Em 2 trilhas"
      />
      <ChoiceCard
        value="q2"
        title="Segurança da informação"
        description="12 perguntas · nota mínima 80% · tentativas ilimitadas"
        aside="Em 1 trilha"
      />
      <ChoiceCard
        value="q3"
        title="Código de conduta"
        description="Publique o quiz para vincular"
        aside="Em nenhuma trilha"
        disabled
      />
    </RadioGroup>
  ),
};

/**
 * Título com selo e uma linha extra (`meta`): o modelo de avaliação e a fórmula
 * da nota final, no assistente de ciclo.
 */
export const ComMeta: Story = {
  render: () => (
    <RadioGroup aria-label="Modelo de avaliação" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ChoiceCard
        value="m1"
        title={
          <span className="flex flex-wrap items-center gap-2">
            Liderança 2026 <Badge variant="outline">Por competência</Badge>
          </span>
        }
        description="Modelo para lideranças, com os pilares da cultura."
        meta="3 pilares · 9 competências"
      />
      <ChoiceCard
        value="m2"
        title="Média ponderada"
        description="O líder pesa mais que a autoavaliação."
        meta={<Badge variant="outline" className="font-normal">(2 × líder + auto) ÷ 3</Badge>}
      />
    </RadioGroup>
  ),
};

/** Com ícone: a escolha do tipo de conteúdo do Academy. */
export const ComIcone: Story = {
  render: () => (
    <RadioGroup aria-label="Tipo de conteúdo" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ChoiceCard
        value="course"
        icon={<PlayCircle />}
        title="Curso isolado"
        description="Um curso com aulas, fora de trilha."
      />
      <ChoiceCard
        value="learning_path"
        icon={<Layers />}
        title="Trilha de aprendizado"
        description="Módulos em sequência, com quiz ao fim de cada um."
      />
    </RadioGroup>
  ),
};

/** Grupo travado (ciclo publicado): a escolha aparece, mas não muda. */
export const Desabilitado: Story = {
  render: () => (
    <RadioGroup disabled defaultValue="leader" aria-label="Quem avalia" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ChoiceCard value="leader" title="Liderança direta" description="Cada pessoa é avaliada pela liderança dela." />
      <ChoiceCard value="specific" title="Pessoas específicas" description="O RH escolhe quem avalia cada pessoa." />
    </RadioGroup>
  ),
};

/** Em 320px: o texto quebra, o rádio e o texto lateral ficam no lugar. */
export const Estreito: Story = {
  decorators: [(Story) => <div className="w-[320px]">{Story()}</div>],
  render: ListaComLateral.render,
};
