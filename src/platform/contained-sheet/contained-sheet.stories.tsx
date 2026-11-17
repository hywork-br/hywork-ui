import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../core/button";
import { SheetTitle } from "../../core/sheet";
import { ContainedSheet } from "./index";

// Dados fictícios: o que o painel mostra é da tela, não do componente.
const NOMES = [
  "Marina Couto", "Otávio Bragança", "Cecília Prado", "Bruno Nakamura", "Iara Santos",
  "Diego Martins", "Lara Menezes", "Rafael Antunes", "Sofia Ribeiro", "Tiago Moura",
  "Helena Duarte", "Caio Lacerda", "Paula Viana", "Renato Prates",
];

/** O contêiner: o elemento da tela, posicionado, com conteúdo clicável. */
function Elemento({
  children,
  onPessoa,
  className,
}: {
  children: React.ReactNode;
  onPessoa: (nome: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative rounded-lg border bg-background p-4 ${className ?? ""}`}>
      <p className="mb-3 text-sm text-muted-foreground">Clique numa pessoa para abrir o painel.</p>
      <ul className="m-0 grid list-none gap-2 p-0">
        {NOMES.map((nome) => (
          <li key={nome}>
            <Button variant="outline" className="w-full justify-start" onClick={() => onPessoa(nome)}>
              {nome}
            </Button>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

function Pessoa({ nome }: { nome: string }) {
  return (
    <div className="flex-1 overflow-auto px-6 pb-6 pt-14">
      <SheetTitle className="text-[22px] font-bold">{nome}</SheetTitle>
      <p className="mt-1 text-sm text-muted-foreground">Analista | Gente e Gestão</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm">Ver perfil completo</Button>
        <Button size="sm" variant="outline">Ver no organograma</Button>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        O corpo é da tela e rola sozinho; o botão de fechar e a alça ficam no lugar.
      </p>
    </div>
  );
}

const meta = {
  title: "Platform/Padrões/ContainedSheet",
  component: ContainedSheet,
  args: { open: false, onOpenChange: () => undefined },
  parameters: {
    docs: {
      description: {
        component:
          "Painel que abre **dentro de um elemento da tela**, e não sobre a página inteira " +
          "como o `Sheet`. Renderiza no lugar onde está, preso ao primeiro ancestral " +
          "posicionado (`relative`) — no editor do Page Builder, não cobre o editor.\n\n" +
          "`side=\"right\"` (padrão): até 480px de largura, sem escurecer nada; o resto do " +
          "elemento continua visível e clicável, e clicar nele não fecha o painel.\n\n" +
          "`side=\"bottom\"`: sobe do pé, com alça no topo, e escurece só o elemento. É " +
          "modal: o foco fica nele, e clicar no fundo escurecido fecha. Fica preso ao pé " +
          "da tela enquanto o elemento está à vista, mesmo que ele seja mais alto que ela.\n\n" +
          "Nos dois: o botão Fechar, Esc e `onOpenChange(false)`. O foco vai ao painel ao " +
          "abrir e volta para onde estava ao fechar. Esc numa busca com sugestões abertas " +
          "fecha as sugestões, não o painel.\n\n" +
          "A forma é **proposta** (a do protótipo do organograma, HCK-435, com tokens), " +
          "aguardando o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof ContainedSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Ao lado: o painel cobre só a direita do elemento, e as pessoas continuam clicáveis. */
export const Lateral: Story = {
  render: function Render() {
    const [nome, setNome] = React.useState<string | null>("Marina Couto");
    return (
      <Elemento onPessoa={setNome} className="h-[560px] overflow-hidden">
        <ContainedSheet open={nome !== null} onOpenChange={(aberto) => !aberto && setNome(null)}>
          {nome ? <Pessoa nome={nome} /> : null}
        </ContainedSheet>
      </Elemento>
    );
  },
};

/** No tablet, a tela estreita o painel pela `className`. */
export const LateralEstreito: Story = {
  render: function Render() {
    const [nome, setNome] = React.useState<string | null>("Cecília Prado");
    return (
      <Elemento onPessoa={setNome} className="h-[560px] max-w-[768px] overflow-hidden">
        <ContainedSheet
          open={nome !== null}
          onOpenChange={(aberto) => !aberto && setNome(null)}
          className="w-[min(440px,92%)]"
        >
          {nome ? <Pessoa nome={nome} /> : null}
        </ContainedSheet>
      </Elemento>
    );
  },
};

/**
 * Embaixo, no celular: o elemento é mais alto que a tela, e o painel fica preso
 * ao pé dela. O fundo escurecido é só o do elemento; clicar nele fecha.
 */
export const Inferior: Story = {
  render: function Render() {
    const [nome, setNome] = React.useState<string | null>(null);
    return (
      <Elemento onPessoa={setNome} className="max-w-[360px]">
        <ContainedSheet side="bottom" open={nome !== null} onOpenChange={(aberto) => !aberto && setNome(null)}>
          {nome ? <Pessoa nome={nome} /> : null}
        </ContainedSheet>
      </Elemento>
    );
  },
};

/** Folha de filtros do celular: título, campos e um rodapé que não rola. */
export const InferiorComRodape: Story = {
  render: function Render() {
    const [aberto, setAberto] = React.useState(true);
    return (
      <div className="relative h-[640px] max-w-[360px] rounded-lg border bg-background p-4">
        <Button variant="outline" onClick={() => setAberto(true)}>Filtros</Button>
        <ContainedSheet side="bottom" open={aberto} onOpenChange={setAberto} closeLabel="Fechar filtros">
          <div className="flex min-h-[52px] items-center pl-4 pr-14 pt-4">
            <SheetTitle className="text-base">Filtros</SheetTitle>
          </div>
          <div className="grid flex-1 gap-3 overflow-auto px-6 pb-6 pt-2 text-sm text-muted-foreground">
            Os campos de filtro vão aqui.
          </div>
          <div className="flex gap-2 border-t px-4 pb-4 pt-3">
            <Button variant="outline" className="min-h-11">Limpar</Button>
            <Button className="min-h-11 flex-1" onClick={() => setAberto(false)}>Ver 14 pessoas</Button>
          </div>
        </ContainedSheet>
      </div>
    );
  },
};
