import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge";
import { BrandTheme } from "../brand-theme";
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

const secoes = (
  <TabsList aria-label="Seções do perfil">
    <TabsTrigger value="perfil">Perfil & assessment</TabsTrigger>
    <TabsTrigger value="pdi">PDI</TabsTrigger>
    <TabsTrigger value="avaliacoes">
      Avaliações
      <Badge variant="attention" tone="subtle">
        1 pendente
      </Badge>
    </TabsTrigger>
    <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
  </TabsList>
);

const conteudos = (
  <>
    <TabsContent value="perfil" className="text-sm">Informações pessoais, cadastrais, cargo e endereço.</TabsContent>
    <TabsContent value="pdi" className="text-sm">Plano de desenvolvimento em andamento.</TabsContent>
    <TabsContent value="avaliacoes" className="text-sm">Uma avaliação aguarda o líder.</TabsContent>
    <TabsContent value="feedbacks" className="text-sm">Feedbacks trocados no ciclo.</TabsContent>
  </>
);

/**
 * Vertical: `orientation="vertical"` põe a lista numa coluna de 240px à
 * esquerda e o conteúdo à direita. Cada aba é uma linha da largura da coluna,
 * alinhada à esquerda; o que vem depois do rótulo — aqui, o `Badge` de
 * pendência — vai para a direita. A ativa tem fundo suave e texto na marca do
 * workspace (`primary-soft`), em peso 600, como a horizontal.
 *
 * Setas para cima e para baixo trocam de aba; Home e End vão à primeira e à
 * última. Abaixo de 768px a lista fica acima do conteúdo.
 *
 * Proposta para o perfil da pessoa do DHO (HCK-308): o visual aguarda o aval
 * da PO.
 */
export const Vertical: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="perfil" className="w-full max-w-[960px]">
      {secoes}
      {conteudos}
    </Tabs>
  ),
};

/**
 * A ativa segue a marca do workspace. Numa marca clara como o laranja, a tinta
 * de texto sobre o branco não basta sobre o fundo suave: o texto suave é
 * calculado contra o próprio fundo, com 4.5:1.
 */
export const VerticalComMarca: Story = {
  render: () => (
    <BrandTheme color="#f97316" className="w-full max-w-[960px]">
      <Tabs orientation="vertical" defaultValue="avaliacoes">
        {secoes}
        {conteudos}
      </Tabs>
    </BrandTheme>
  ),
};

/** Aba indisponível na vertical: continua na lista, esmaecida, e as setas a pulam. */
export const VerticalComAbaDesabilitada: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="perfil" className="w-full max-w-[960px]">
      <TabsList aria-label="Seções do perfil">
        <TabsTrigger value="perfil">Perfil & assessment</TabsTrigger>
        <TabsTrigger value="docs" disabled>
          Documentos privados
        </TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>
      <TabsContent value="perfil" className="text-sm">Informações pessoais.</TabsContent>
      <TabsContent value="feedbacks" className="text-sm">Feedbacks trocados no ciclo.</TabsContent>
    </Tabs>
  ),
};

/** Tela estreita: a lista vem acima do conteúdo, ainda uma linha por aba. */
export const VerticalTelaEstreita: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => (
    <Tabs orientation="vertical" defaultValue="perfil" className="w-full">
      {secoes}
      {conteudos}
    </Tabs>
  ),
};
