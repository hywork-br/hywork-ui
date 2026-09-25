import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FilterBar } from "./index";

const meta = {
  title: "Platform/Padrões/FilterBar",
  component: FilterBar,
  parameters: {
    docs: {
      description: {
        component:
          "Barra de filtros de listagem. Substitui as nove implementações " +
          "independentes que existiam no Platform — barra, chips, moldura, " +
          "cartão, gradiente, painel lateral e grade.\n\n" +
          "A anatomia é fixa: busca à esquerda, dimensões no meio, ação de " +
          "limpar à direita. A página escolhe quantos campos tem e de que " +
          "tipo, nunca como a barra é desenhada.",
      },
    },
  },
  // As stories controlam o estado no próprio render; estes args existem
  // apenas para satisfazer a obrigatoriedade de onClear no tipo.
  args: { onClear: () => undefined },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** O caso mais completo do produto: a tela de Usuários, com duas buscas e três dimensões. */
export const Completo: Story = {
  render: function Render() {
    const [nome, setNome] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [status, setStatus] = React.useState("all");
    const [grupo, setGrupo] = React.useState("all");

    return (
      <FilterBar
        onClear={() => {
          setNome("");
          setEmail("");
          setStatus("all");
          setGrupo("all");
        }}
      >
        <FilterBar.Search placeholder="Buscar por nome" value={nome} onChange={setNome} />
        <FilterBar.Search placeholder="Buscar por e-mail" value={email} onChange={setEmail} />
        <FilterBar.Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Todos os status" },
            { value: "active", label: "Ativos" },
            { value: "inactive", label: "Inativos" },
          ]}
        />
        <FilterBar.Select
          label="Grupo de acesso"
          value={grupo}
          onChange={setGrupo}
          options={[
            { value: "all", label: "Todos os grupos" },
            { value: "admin", label: "Administradores" },
            { value: "member", label: "Colaboradores" },
          ]}
        />
      </FilterBar>
    );
  },
};

/** Sem filtro ativo, a ação de limpar não aparece — nada para desfazer. */
export const EmRepouso: Story = {
  render: function Render() {
    const [busca, setBusca] = React.useState("");
    return (
      <FilterBar onClear={() => setBusca("")}>
        <FilterBar.Search placeholder="Buscar campanha" value={busca} onChange={setBusca} />
      </FilterBar>
    );
  },
};

/** Com filtro ativo, "Limpar" aparece à direita. */
export const ComFiltroAtivo: Story = {
  render: function Render() {
    const [busca, setBusca] = React.useState("integração");
    const [status, setStatus] = React.useState("running");
    return (
      <FilterBar
        onClear={() => {
          setBusca("");
          setStatus("all");
        }}
      >
        <FilterBar.Search placeholder="Buscar desafio" value={busca} onChange={setBusca} />
        <FilterBar.Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Todos" },
            { value: "running", label: "Em curso" },
            { value: "finished", label: "Finalizados" },
          ]}
        />
      </FilterBar>
    );
  },
};

/**
 * Variante de apresentação prevista: a mesma dimensão em chips, em vez de
 * seletor. É a forma que a tela de Desafios usava — legítima, e agora dentro
 * do padrão em vez de reinventada.
 */
export const ComChips: Story = {
  render: function Render() {
    const [status, setStatus] = React.useState("all");
    const [campanha, setCampanha] = React.useState("all");
    return (
      <FilterBar onClear={() => { setStatus("all"); setCampanha("all"); }}>
        <FilterBar.Chips
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "Todos" },
            { value: "scheduled", label: "Agendados" },
            { value: "running", label: "Em curso" },
            { value: "finished", label: "Finalizados" },
          ]}
        />
        <FilterBar.Select
          label="Campanha"
          value={campanha}
          onChange={setCampanha}
          options={[
            { value: "all", label: "Todas" },
            { value: "onboarding", label: "Integração 2026" },
          ]}
        />
      </FilterBar>
    );
  },
};

/** Só dimensões, sem busca — a barra não exige um campo de texto. */
export const SemBusca: Story = {
  render: function Render() {
    const [periodo, setPeriodo] = React.useState("30d");
    return (
      <FilterBar onClear={() => setPeriodo("30d")}>
        <FilterBar.Select
          label="Período"
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: "30d", label: "Últimos 30 dias" },
            { value: "90d", label: "Últimos 90 dias" },
          ]}
        />
      </FilterBar>
    );
  },
};

/** Enquanto os dados carregam, os controles ficam inativos sem sumir da tela. */
export const Carregando: Story = {
  render: function Render() {
    return (
      <FilterBar loading onClear={() => undefined}>
        <FilterBar.Search placeholder="Buscar por nome" value="" onChange={() => undefined} />
        <FilterBar.Select
          label="Status"
          value="all"
          onChange={() => undefined}
          options={[{ value: "all", label: "Todos os status" }]}
        />
      </FilterBar>
    );
  },
};

/**
 * Slot genérico, para o que não é busca nem seleção. A tela da Lixeira filtra
 * por intervalo de datas — o campo informa se está ativo, porque só ele sabe
 * o que é "vazio" no seu caso.
 */
export const ComCampoProprio: Story = {
  render: function Render() {
    const [de, setDe] = React.useState("");
    const [ate, setAte] = React.useState("");
    return (
      <FilterBar onClear={() => { setDe(""); setAte(""); }}>
        <FilterBar.Field label="De" active={de !== ""}>
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            aria-label="Data inicial"
            className="flex h-10 w-full rounded-sm border border-slate-300/80 bg-white px-3 text-sm"
          />
        </FilterBar.Field>
        <FilterBar.Field label="Até" active={ate !== ""}>
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            aria-label="Data final"
            className="flex h-10 w-full rounded-sm border border-slate-300/80 bg-white px-3 text-sm"
          />
        </FilterBar.Field>
      </FilterBar>
    );
  },
};
