import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { Avatar, AvatarFallback, Badge, Button } from "../../src/core";
import { FilterBar, ItemCard } from "../../src/platform/index";
import { brandThemeVars } from "../../src/theme";

// A card grid like the people list of HCK-308, on the package CSS: the
// FilterBar with "Limpar filtros" and vertical ItemCards in an auto-fill grid.
// What jsdom cannot measure lives here: the 108px media frame filled by the
// Avatar, the ellipsis on a long title and the actions lined up at the foot of
// a row. Invented data only. `?brand=f97316` applies a workspace brand.
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

const equipe = [
  { id: "1", iniciais: "LM", titulo: "Lara Menezes", descricao: "Analista de Suporte", status: "Em dia" },
  { id: "2", iniciais: "OT", titulo: "Otávio Teixeira Bragança de Albuquerque", descricao: "Coordenador de Projetos Especiais e Operações", status: "1 pendência" },
  { id: "3", iniciais: "CP", titulo: "Cecília Prado", descricao: "Designer", status: "" },
  { id: "4", iniciais: "BN", titulo: "Bruno Nakamura", descricao: "Desenvolvedor", status: "Em dia" },
  { id: "5", iniciais: "IS", titulo: "Iara Santos", descricao: "Analista Financeira", status: "Em dia" },
];

function App() {
  const [busca, setBusca] = React.useState("ana");
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Equipe</h1>
      <FilterBar clearLabel="Limpar filtros" onClear={() => setBusca("")}>
        <FilterBar.Search placeholder="Buscar por nome" value={busca} onChange={setBusca} />
      </FilterBar>
      <ul data-testid="grade" className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4">
        {equipe.map((p) => (
          <ItemCard
            key={p.id}
            as="li"
            orientation="vertical"
            data-testid={"card-" + p.id}
            titleAs="h2"
            title={p.titulo}
            description={p.descricao}
            media={
              <Avatar>
                <AvatarFallback>{p.iniciais}</AvatarFallback>
              </Avatar>
            }
            status={p.status ? <Badge variant={p.status === "Em dia" ? "positive" : "attention"} tone="subtle">{p.status}</Badge> : undefined}
            actions={
              <Button size="sm" variant="outline">
                Acompanhar
              </Button>
            }
          />
        ))}
      </ul>
      <ItemCard
        data-testid="horizontal"
        titleAs="h2"
        title="Relatório trimestral"
        description="Atualizado há 2 dias"
        media={
          <Avatar>
            <AvatarFallback>RT</AvatarFallback>
          </Avatar>
        }
        className="max-w-[480px]"
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
