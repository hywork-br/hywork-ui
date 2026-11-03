import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Badge } from "../../src/core";
import { DataList, type DataListColumn } from "../../src/platform/index";
import { brandThemeVars } from "../../src/theme";

// Row selection on the DataList (HCK-258), on the package CSS. What jsdom
// cannot measure lives here: the row keeps its height when marked, with the
// stripe, `rowHeight` and `minWidth` on; the selection column does not make a
// row taller nor change width while loading; the marked row paints the table
// selection token over the stripe and the hover; the focus ring shows on the
// box. Invented data only. `?brand=f97316` applies a workspace brand.
//
// The badge is the neutral one, as in the "Pendências" tab. The subtle status
// badges (`tone="subtle"`) fall below 4.5:1 on a marked row (3.93–4.49:1,
// HCK-258): a question to the PO, not something this page hides.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
const html = document.documentElement;
html.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
const brand = params.get("brand");
if (brand) for (const [name, value] of Object.entries(brandThemeVars("#" + brand))) html.style.setProperty(name, value);
document.body.className = "bg-background text-foreground";

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

const COLUNAS: DataListColumn<Pessoa>[] = [
  { key: "nome", header: "Pessoa", cell: (p) => p.nome },
  { key: "area", header: "Área", cell: (p) => p.area },
  { key: "pendencia", header: "Pendência", cell: (p) => <Badge variant="neutral">{p.pendencia}</Badge> },
];

const getKey = (p: Pessoa) => p.id;
const getLabel = (p: Pessoa) => `Selecionar ${p.nome}`;

function App() {
  const [marcadas, setMarcadas] = React.useState<ReadonlySet<string>>(new Set());
  const [naturais, setNaturais] = React.useState<ReadonlySet<string>>(new Set());
  const [aberto, setAberto] = React.useState("nenhum");
  return (
    <main className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Pendências</h1>

      <section className="space-y-2">
        <p data-testid="aberto" className="text-sm">Aberto: {aberto}</p>
        <DataList
          data-testid="com"
          aria-label="Pendências com altura fixa"
          items={PESSOAS}
          columns={COLUNAS}
          getKey={getKey}
          rowHeight="h-[76px]"
          minWidth="720px"
          onRowClick={(p) => setAberto(p.nome)}
          selection={{ selectedKeys: marcadas, onChange: setMarcadas, getLabel, selectAllLabel: "Selecionar todas desta página" }}
        />
      </section>

      <DataList
        data-testid="com-natural"
        aria-label="Pendências com seleção"
        items={PESSOAS}
        columns={COLUNAS}
        getKey={getKey}
        selection={{ selectedKeys: naturais, onChange: setNaturais, getLabel }}
      />

      <DataList data-testid="sem" aria-label="Pendências sem seleção" items={PESSOAS} columns={COLUNAS} getKey={getKey} />

      <DataList
        data-testid="carregando"
        aria-label="Pendências carregando"
        items={[]}
        columns={COLUNAS}
        getKey={getKey}
        loading
        loadingRows={2}
        rowHeight="h-[76px]"
        minWidth="720px"
        selection={{ selectedKeys: marcadas, onChange: setMarcadas, getLabel }}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
