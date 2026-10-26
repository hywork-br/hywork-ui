import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/core";
import { DescriptionList, type DescriptionListItem } from "../../src/platform/index";
import { brandThemeVars } from "../../src/theme";

// The person profile of HCK-308 on the package CSS: vertical tabs with a
// count badge, the horizontal tabs next to them, and the DescriptionList in
// collapsible sections. What jsdom cannot measure lives here: the two-column
// layout and its stacking, the grid of the list at each width and the
// contrast of the active row. `?brand=f97316` applies a workspace brand.
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

// Fictitious data, shaped like the prototype's "Informações pessoais".
const pessoais: DescriptionListItem[] = [
  { label: "Nome completo", value: "Ana Beatriz Lima", span: 2 },
  { label: "Nome social", value: null },
  { label: "Data de nascimento", value: "09/07/1990" },
  { label: "Gênero", value: "Feminino" },
  { label: "Estado civil", value: "Solteira" },
  { label: "E-mail corporativo", value: "marina.duarte@empresa.com.br", span: 2 },
  { label: "Telefone", value: "(11) 90000-1234" },
  { label: "Contato de emergência", value: "Paulo Lima · pai · (11) 90000-5678", span: 3 },
];

function App() {
  return (
    <main className="space-y-10 p-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <section className="max-w-[640px]">
        <Tabs defaultValue="ativos" data-testid="horizontal">
          <TabsList aria-label="Situação">
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
            <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
            <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
          </TabsList>
          <TabsContent value="ativos" className="text-sm">Documentos ativos.</TabsContent>
        </Tabs>
      </section>

      <Tabs orientation="vertical" defaultValue="perfil" data-testid="vertical" className="max-w-[1200px]">
        <TabsList aria-label="Seções do perfil">
          <TabsTrigger value="perfil">Perfil & assessment</TabsTrigger>
          <TabsTrigger value="pdi">PDI</TabsTrigger>
          <TabsTrigger value="avaliacoes">
            Avaliações
            <Badge variant="attention" tone="subtle" data-testid="selo">
              1 pendente
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil">
          <h2 className="mb-4 text-lg font-semibold">Perfil & assessment</h2>
          <Accordion type="multiple" defaultValue={["pessoais"]} className="flex flex-col gap-4">
            <Card>
              <AccordionItem value="pessoais" className="border-b-0 px-5">
                <AccordionTrigger className="text-base font-semibold">Informações pessoais</AccordionTrigger>
                <AccordionContent>
                  <DescriptionList items={pessoais} columns={3} data-testid="lista" />
                </AccordionContent>
              </AccordionItem>
            </Card>
          </Accordion>
        </TabsContent>
        <TabsContent value="pdi" className="text-sm">Plano de desenvolvimento.</TabsContent>
        <TabsContent value="avaliacoes" className="text-sm">Uma avaliação aguarda o líder.</TabsContent>
        <TabsContent value="feedbacks" className="text-sm">Feedbacks do ciclo.</TabsContent>
      </Tabs>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
