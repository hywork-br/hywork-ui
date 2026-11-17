import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../../core/avatar";
import { SearchCombobox } from "./index";

// Dados fictícios do catálogo. Quem sabe o que é pessoa ou área é a story, não
// o componente: ele recebe itens e a forma de desenhá-los.
interface Sugestao {
  id: string;
  tipo: "pessoa" | "area";
  nome: string;
  detalhe: string;
}

const SUGESTOES: Sugestao[] = [
  { id: "p1", tipo: "pessoa", nome: "Marina Couto", detalhe: "Analista de RH, Gente e Gestão" },
  { id: "p2", tipo: "pessoa", nome: "Mariana Teles", detalhe: "Coordenadora, Financeiro" },
  { id: "p3", tipo: "pessoa", nome: "Mário Fontes", detalhe: "Desenvolvedor, Engenharia" },
  { id: "a1", tipo: "area", nome: "Marketing", detalhe: "Área, 12 pessoas" },
  { id: "a2", tipo: "area", nome: "Marketplace", detalhe: "Equipe, 5 pessoas" },
];

const semAcento = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const buscar = (q: string) => {
  const termo = semAcento(q.trim());
  return termo ? SUGESTOES.filter((s) => semAcento(`${s.nome} ${s.detalhe}`).includes(termo)) : [];
};

const iniciais = (nome: string) =>
  nome.split(" ").slice(0, 2).map((p) => p[0]).join("");

function Linha({ item }: { item: Sugestao }) {
  return (
    <>
      {item.tipo === "pessoa" ? (
        <Avatar className="h-[30px] w-[30px]">
          <AvatarFallback className="text-xs">{iniciais(item.nome)}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{item.nome}</span>
        <span className="block text-xs text-muted-foreground">{item.detalhe}</span>
      </span>
    </>
  );
}

function Busca({ inicial = "" }: { inicial?: string }) {
  const [texto, setTexto] = React.useState(inicial);
  const [escolhido, setEscolhido] = React.useState<string | null>(null);
  return (
    <div className="max-w-md space-y-3">
      <SearchCombobox
        label="Buscar no organograma"
        placeholder="Buscar pessoa, cargo ou área"
        value={texto}
        onChange={setTexto}
        items={buscar(texto)}
        getKey={(s) => s.id}
        renderItem={(s) => <Linha item={s} />}
        onPick={(s) => {
          setEscolhido(s.nome);
          setTexto("");
        }}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {escolhido ? `Escolhido: ${escolhido}` : "Nada escolhido ainda."}
      </p>
    </div>
  );
}

const focar = (canvas: HTMLElement) => canvas.querySelector<HTMLInputElement>('[role="combobox"]');

const meta = {
  title: "Platform/Padrões/SearchCombobox",
  component: SearchCombobox,
  args: {
    label: "Buscar",
    value: "",
    onChange: () => undefined,
    items: [],
    getKey: () => "",
    renderItem: () => null,
    onPick: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Busca com sugestões: o `SearchInput` (lupa, altura 40, raio 4) com uma lista " +
          "de sugestões abaixo dele. A tela filtra e passa os itens; o componente desenha " +
          "a lista, cuida do teclado e do padrão combobox/listbox.\n\n" +
          "Digite para abrir. ↑/↓ movem a opção ativa, Enter escolhe (a primeira, se " +
          "nenhuma estiver ativa), Esc fecha a lista sem apagar o texto e sem fechar o " +
          "painel atrás dela, clique escolhe, clicar fora fecha.\n\n" +
          "A forma é **proposta** (a do protótipo do organograma, HCK-435, com tokens), " +
          "aguardando o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof SearchCombobox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Fechada: o campo de busca, sem lista. Digite "mar" para abrir. */
export const Fechada: Story = { render: () => <Busca /> };

/** Aberta com resultados: pessoas com avatar e áreas com ícone, cada linha desenhada pela tela. */
export const AbertaComResultados: Story = {
  render: () => <Busca inicial="mar" />,
  play: async ({ canvasElement }) => focar(canvasElement)?.focus(),
};

/** Aberta sem resultado: a frase diz o que foi buscado. */
export const AbertaSemResultado: Story = {
  render: () => <Busca inicial="zz" />,
  play: async ({ canvasElement }) => focar(canvasElement)?.focus(),
};

/** Opção ativa: ↓ duas vezes. O fundo marca a ativa, e Enter a escolhe. */
export const OpcaoAtiva: Story = {
  render: () => <Busca inicial="mar" />,
  play: async ({ canvasElement }) => {
    const campo = focar(canvasElement);
    campo?.focus();
    for (let i = 0; i < 2; i++)
      campo?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  },
};

/** Desabilitada: enquanto os dados carregam, o campo não aceita texto. */
export const Desabilitada: Story = {
  render: () => (
    <div className="max-w-md">
      <SearchCombobox
        label="Buscar no organograma"
        placeholder="Buscar pessoa, cargo ou área"
        value=""
        onChange={() => undefined}
        items={[]}
        getKey={() => ""}
        renderItem={() => null}
        onPick={() => undefined}
        disabled
      />
    </div>
  ),
};
