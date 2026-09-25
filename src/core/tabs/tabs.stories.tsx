import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./index";

const meta = { title: "Core/Tabs", component: Tabs } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Decisão da PO: sublinhado, altura 48, indicador de 2px na cor primária, fundo
 * transparente.
 *
 * Abas mudam de **assunto**. Para estreitar uma mesma lista, use os chips da
 * `FilterBar` — foi o que Campanhas e Modelos de página passaram a fazer.
 */
export const Padrao: Story = {
  render: () => (
    <Tabs defaultValue="conteudos" className="w-[520px]">
      <TabsList>
        <TabsTrigger value="conteudos">Conteúdos</TabsTrigger>
        <TabsTrigger value="certificados">Certificados</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="conteudos" className="pt-4 text-sm">Cursos e trilhas.</TabsContent>
      <TabsContent value="certificados" className="pt-4 text-sm">Modelos de certificado.</TabsContent>
      <TabsContent value="logs" className="pt-4 text-sm">Atividades registradas.</TabsContent>
    </Tabs>
  ),
};

/** Uma aba indisponível continua visível, para não esconder o que existe. */
export const ComAbaDesabilitada: Story = {
  render: () => (
    <Tabs defaultValue="a" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="a">Disponível</TabsTrigger>
        <TabsTrigger value="b" disabled>Requer plano</TabsTrigger>
      </TabsList>
      <TabsContent value="a" className="pt-4 text-sm">Conteúdo.</TabsContent>
    </Tabs>
  ),
};
