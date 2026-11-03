import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRightLeft, Copy, Download, PencilLine, Send, Trash2, X } from "lucide-react";
import { Alert } from "../../core/alert";
import { Badge } from "../../core/badge";
import { Button } from "../../core/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../core/select";
import { DataList, type DataListColumn } from "../data-list";
import { SelectionBar } from "./index";

interface Pessoa {
  id: string;
  nome: string;
  area: string;
  pendencia: string;
}

const PESSOAS: Pessoa[] = [
  { id: "1", nome: "Lara Menezes", area: "Suporte", pendencia: "Nenhuma etapa iniciada" },
  { id: "2", nome: "Otávio Bragança", area: "Projetos", pendencia: "Aguardando o líder" },
  { id: "3", nome: "Cecília Prado", area: "Design", pendencia: "Aguardando autoavaliação" },
  { id: "4", nome: "Bruno Nakamura", area: "Engenharia", pendencia: "Nenhuma etapa iniciada" },
  { id: "5", nome: "Iara Santos", area: "Financeiro", pendencia: "Aguardando o líder" },
  { id: "6", nome: "Diego Martins", area: "Comercial", pendencia: "Aguardando autoavaliação" },
];

/** Quantas pendências batem com o filtro, em todas as páginas. */
const NO_FILTRO = 57;

const COLUNAS: DataListColumn<Pessoa>[] = [
  { key: "nome", header: "Pessoa", cell: (p) => p.nome },
  { key: "area", header: "Área", cell: (p) => p.area },
  { key: "pendencia", header: "Pendência", cell: (p) => <Badge variant="neutral">{p.pendencia}</Badge> },
];

const COLUNAS_CURTAS = COLUNAS.filter((c) => c.key !== "area");

const contagem = (n: number) =>
  n === 0 ? "Nenhuma selecionada" : n === 1 ? "1 selecionada" : `${n} selecionadas`;

function useSelecao(inicial: string[] = []) {
  return React.useState<ReadonlySet<string>>(() => new Set(inicial));
}

function Lista({
  chaves,
  onChange,
  colunas = COLUNAS,
}: {
  chaves: ReadonlySet<string>;
  onChange: (chaves: Set<string>) => void;
  colunas?: DataListColumn<Pessoa>[];
}) {
  return (
    <DataList
      aria-label="Pendências"
      items={PESSOAS}
      columns={colunas}
      getKey={(p) => p.id}
      minWidth="360px"
      selection={{
        selectedKeys: chaves,
        onChange,
        getLabel: (p) => `Selecionar ${p.nome}`,
        selectAllLabel: "Selecionar todas desta página",
      }}
    />
  );
}

const meta = {
  title: "Platform/Padrões/SelectionBar",
  component: SelectionBar,
  args: { count: 2, label: "2 selecionadas", onClear: () => undefined },
  parameters: {
    docs: {
      description: {
        component:
          "Ação em massa sobre a seleção de uma listagem: a contagem, o que vai " +
          "ao lado dela (\"Selecionar todas as N\"), as ações e \"Limpar seleção\". " +
          "Fica acima da listagem, solta: serve ao `DataList` com `selection` e a " +
          "qualquer lista que se marque.\n\n" +
          "Sem seleção ela some e **guarda o lugar**: a listagem não pula quando a " +
          "barra aparece. Com `persistent`, fica à vista e desabilita as ações.\n\n" +
          "A forma é **proposta** (a da barra de Bases de dados, com tokens), " +
          "aguardando o aval da PO. A story *Opções* põe as quatro formas do " +
          "produto lado a lado.",
      },
    },
  },
} satisfies Meta<typeof SelectionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A aba Pendências do ciclo (HCK-258): o RH marca as pessoas e envia o
 * lembrete. Desmarque todas: a barra some e a lista não sobe.
 */
export const Padrao: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["2", "5"]);
    return (
      <div>
        <SelectionBar count={chaves.size} label={contagem(chaves.size)} onClear={() => setChaves(new Set())}>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            Enviar lembrete
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/** Sem seleção: a barra não aparece, mas o lugar dela fica guardado. */
export const SemSelecao: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao();
    return (
      <div>
        <SelectionBar count={chaves.size} label={contagem(chaves.size)} onClear={() => setChaves(new Set())}>
          <Button size="sm">Enviar lembrete</Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/**
 * "Selecionar todas as N": com a página inteira marcada, `detail` oferece as
 * que batem com o filtro, em todas as páginas. A contagem é da tela, e por isso
 * pode dizer "Todas as 57 pendências selecionadas". Marque a página inteira.
 */
export const SelecionarTodasAsN: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["1", "2", "3", "4", "5", "6"]);
    const [todas, setTodas] = React.useState(false);
    const paginaInteira = PESSOAS.every((p) => chaves.has(p.id));
    const mudar = (proximas: Set<string>) => {
      setTodas(false);
      setChaves(proximas);
    };
    return (
      <div>
        <SelectionBar
          count={todas ? NO_FILTRO : chaves.size}
          label={todas ? `Todas as ${NO_FILTRO} pendências selecionadas` : contagem(chaves.size)}
          detail={
            paginaInteira && !todas ? (
              <Button variant="link" size="sm" onClick={() => setTodas(true)}>
                Selecionar todas as {NO_FILTRO} pendências
              </Button>
            ) : undefined
          }
          onClear={() => mudar(new Set())}
        >
          <Button size="sm">Enviar lembrete</Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={mudar} />
      </div>
    );
  },
};

/**
 * Ação destrutiva ao lado de outra: as pessoas da Estrutura organizacional
 * ("Remover", "Alocar"). O que não depende da seleção ("Adicionar pessoas")
 * fica fora da barra, nas ações da tela.
 */
export const AcaoDestrutiva: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["1", "4"]);
    return (
      <div>
        <SelectionBar count={chaves.size} label={contagem(chaves.size)} onClear={() => setChaves(new Set())}>
          <Button size="sm" variant="outline">
            <ArrowRightLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Alocar
          </Button>
          <Button size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Remover
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/** Várias ações, como nos registros de Bases de dados. Em tela estreita, quebram de linha. */
export const VariasAcoes: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["2", "3", "6"]);
    return (
      <div>
        <SelectionBar
          aria-label="Ações nos registros selecionados"
          count={chaves.size}
          label={contagem(chaves.size)}
          onClear={() => setChaves(new Set())}
        >
          <Button size="sm" variant="outline">
            <PencilLine className="mr-2 h-4 w-4" aria-hidden="true" />
            Editar campo
          </Button>
          <Button size="sm" variant="outline">
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Duplicar
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </Button>
          <Button size="sm" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Excluir
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/**
 * Um campo como ação, como no assistente do ciclo ("Definir avaliador para N
 * selecionadas"). A barra cresce até a altura do campo.
 */
export const ComCampo: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["2", "3"]);
    return (
      <div>
        <SelectionBar
          aria-label="Ações em lote"
          count={chaves.size}
          label={chaves.size === 1 ? "1 pessoa selecionada" : `${chaves.size} pessoas selecionadas`}
          onClear={() => setChaves(new Set())}
        >
          <Select>
            <SelectTrigger className="w-full sm:w-80" aria-label="Definir avaliador">
              <SelectValue placeholder={`Definir avaliador para ${chaves.size} selecionadas`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lara">Lara Menezes</SelectItem>
              <SelectItem value="bruno">Bruno Nakamura</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            Remover avaliador
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/**
 * `persistent`: a barra fica à vista sem seleção, como nos resultados
 * individuais do ciclo. Sem nada marcado, as ações ficam desabilitadas sozinhas
 * e "Limpar seleção" não aparece. A contagem é a da tela, com o filtro.
 */
export const Persistente: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao();
    const n = chaves.size;
    return (
      <div>
        <SelectionBar
          persistent
          count={n}
          label={n === 0 ? contagem(0) : `${contagem(n)} · ${n} neste filtro`}
          onClear={() => setChaves(new Set())}
        >
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Exportar selecionados
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/**
 * Ação desabilitada por outro motivo, com a nota em `detail` ligada ao botão
 * por `aria-describedby` — "Disponível quando a calibragem terminar".
 */
export const AcaoDesabilitadaComNota: Story = {
  render: function Render() {
    const [chaves, setChaves] = useSelecao(["1", "2", "3"]);
    const nota = React.useId();
    return (
      <div>
        <SelectionBar
          persistent
          count={chaves.size}
          label={contagem(chaves.size)}
          detail={<span id={nota}>Disponível quando a calibragem terminar</span>}
          onClear={() => setChaves(new Set())}
        >
          <Button size="sm" disabled aria-describedby={nota}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Exportar selecionados
          </Button>
        </SelectionBar>
        <Lista chaves={chaves} onChange={setChaves} />
      </div>
    );
  },
};

/** Tela estreita: contagem numa linha, ações na seguinte. */
export const TelaEstreita: Story = {
  ...Padrao,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

/** Um painel de comparação: a forma de uma tela do produto sobre a mesma lista. */
function Opcao({
  letra,
  titulo,
  origem,
  barra,
}: {
  letra: string;
  titulo: string;
  origem: string;
  barra: (n: number, limpar: () => void) => React.ReactNode;
}) {
  const [chaves, setChaves] = useSelecao(["2", "3", "5"]);
  return (
    <section data-testid={`opcao-${letra}`} aria-labelledby={`opcao-${letra}-titulo`} className="space-y-4 p-4">
      <header>
        <h2 id={`opcao-${letra}-titulo`} className="text-base font-semibold">
          Opção {letra} — {titulo}
        </h2>
        <p className="text-sm text-muted-foreground">{origem}</p>
      </header>
      {barra(chaves.size, () => setChaves(new Set()))}
      <Lista chaves={chaves} onChange={setChaves} colunas={COLUNAS_CURTAS} />
    </section>
  );
}

/**
 * As quatro formas de ação em massa que o produto tem hoje, cada uma com as
 * classes da tela de origem, sobre a mesma lista com 3 pessoas marcadas, para
 * a PO comparar. O texto e o ícone da ação são os da Pendências; as classes e
 * as variantes, os da origem (em C, a do "Alocar (N)", porque lembrete não é
 * destrutivo como o "Remover (N)"). A proposta do componente é a forma B, com
 * tokens.
 */
export const Opcoes: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div data-testid="opcoes" className="grid gap-x-6 gap-y-8 p-4 xl:grid-cols-2">
      <Opcao
        letra="A"
        titulo="aviso informativo acima da lista"
        origem="Usuários (Configurações); avaliadores do assistente do ciclo (DHO)"
        barra={(n, limpar) => (
          <Alert variant="info" className="mb-4">
            <p className="text-sm font-medium">{n} pessoas selecionadas</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={limpar}>
                Limpar seleção
              </Button>
              <Button size="sm">Enviar lembrete</Button>
            </div>
          </Alert>
        )}
      />
      <Opcao
        letra="B"
        titulo="barra própria com a cor do workspace"
        origem="Bases de dados (registros); lá ela toma o lugar da busca"
        barra={(n, limpar) => (
          <div
            role="toolbar"
            aria-label="Ações nos registros selecionados"
            className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2"
          >
            <span className="mr-auto text-sm font-medium">{contagem(n)}</span>
            <Button type="button" size="sm" variant="outline">
              <Send className="mr-1 size-4" aria-hidden />
              Enviar lembrete
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={limpar}>
              <X className="mr-1 size-4" aria-hidden />
              Limpar seleção
            </Button>
          </div>
        )}
      />
      <Opcao
        letra="C"
        titulo="botão com a contagem nas ações da tela"
        origem={'Estrutura organizacional (pessoas da área): "Remover (N)" e "Alocar (N)"'}
        barra={(n) => (
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
            {n > 0 && (
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Enviar lembrete ({n})
              </Button>
            )}
          </div>
        )}
      />
      <Opcao
        letra="D"
        titulo="linha de seleção sempre à vista, sem moldura"
        origem={'Resultados individuais do ciclo (DHO): "Exportar selecionados", desabilitado sem seleção'}
        barra={(n, limpar) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p aria-live="polite" className="text-sm font-semibold text-foreground">
                {contagem(n)}
                {n > 0 ? ` · ${n} neste filtro` : ""}
              </p>
              <Button type="button" variant="link" className="h-auto p-0">
                Selecionar todas as {NO_FILTRO}
              </Button>
              {n > 0 ? (
                <Button type="button" variant="link" className="h-auto p-0" onClick={limpar}>
                  Limpar seleção
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <Button type="button" disabled={n === 0}>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  Enviar lembrete
                </Button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  ),
};
