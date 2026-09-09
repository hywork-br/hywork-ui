import { createElement, type ComponentType } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  Academy,
  Conteudos,
  AssinaturasEmail,
  TvCorporativa,
} from "../../stories/FeaturePilots.stories";
import { academy, emptyFilters, matches } from "../../stories/pilots/model";

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, "", "/");
});
it("keeps Academy type separate from category and uses active/draft/inactive", async () => {
  const user = userEvent.setup();
  render(createElement(Academy.render as ComponentType));
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  expect(screen.getByRole("option", { name: "Inativo" })).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: "Agendado" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("combobox", { name: "Tipo" }));
  await user.click(screen.getByRole("option", { name: "Curso" }));
  await user.click(screen.getByRole("button", { name: "Mais filtros" }));
  await user.click(screen.getByRole("combobox", { name: "Categoria" }));
  await user.click(screen.getByRole("option", { name: "Onboarding" }));
  await user.keyboard("{Escape}");
  expect(
    screen.getByRole("heading", { name: "Integração de novos colaboradores" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Segurança na operação" }),
  ).not.toBeInTheDocument();
  expect(location.search).toContain("pilot-academy-category=Onboarding");
});
it("filters Contents by real editorial tags and exposes all fixture authors", async () => {
  const user = userEvent.setup();
  render(createElement(Conteudos.render as ComponentType));
  await user.click(screen.getByRole("button", { name: "Mais filtros" }));
  await user.click(screen.getByRole("combobox", { name: "Autor" }));
  for (const name of ["Marina Alves", "Beatriz Nunes", "Rafael Costa"])
    expect(screen.getByRole("option", { name })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("combobox", { name: "Etiqueta" }));
  await user.click(screen.getByRole("option", { name: "Resultados" }));
  await user.keyboard("{Escape}");
  const table = screen.getByRole("table", { name: "Conteúdos editoriais" });
  expect(within(table).getAllByRole("row")).toHaveLength(2);
  expect(within(table).getByText("Resultados do semestre")).toBeInTheDocument();
  expect(within(table).getByText("Arquivado")).toBeInTheDocument();
  expect(location.search).toContain("pilot-contents-tag=Resultados");
});
it("shows TV configurations and widgets rather than device telemetry", async () => {
  const user = userEvent.setup();
  render(createElement(TvCorporativa.render as ComponentType));
  const table = screen.getByRole("table", { name: "Configurações de TV" });
  expect(
    within(table).getByRole("columnheader", { name: "Widgets" }),
  ).toBeInTheDocument();
  expect(
    within(table).getByText("Conteúdos em destaque · Relógio"),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Unidade" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  expect(screen.getByRole("option", { name: "Inativo" })).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: "Agendado" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: "Rascunho" }),
  ).not.toBeInTheDocument();
});
it("renders each signature layout and its actual fields without assigned audience counts", () => {
  render(createElement(AssinaturasEmail.render as ComponentType));
  const card = (name: string) =>
    screen.getByRole("heading", { name }).closest("article")!;
  const horizontal = card("Institucional"),
    vertical = card("Relacionamento"),
    compact = card("Essencial");
  expect(horizontal.querySelector('[data-layout="horizontal"]')).not.toBeNull();
  expect(vertical.querySelector('[data-layout="vertical"]')).not.toBeNull();
  expect(compact.querySelector('[data-layout="compact"]')).not.toBeNull();
  expect(horizontal).toHaveTextContent("Telefone");
  expect(vertical).toHaveTextContent("Área");
  expect(compact).toHaveTextContent("E-mail");
  expect(compact).not.toHaveTextContent("Telefone");
  expect(screen.queryByText(/32 pessoas/)).not.toBeInTheDocument();
});
it("counts inclusive calendar dates and rejects future items for period filtering", () => {
  const sample = academy.items[0];
  expect(
    matches(
      { ...sample, updated: "2026-09-01" },
      { ...emptyFilters, period: "7" },
    ),
  ).toBe(true);
  expect(
    matches(
      { ...sample, updated: "2026-08-31" },
      { ...emptyFilters, period: "7" },
    ),
  ).toBe(false);
  expect(
    matches(
      { ...sample, updated: "2026-08-09" },
      { ...emptyFilters, period: "30" },
    ),
  ).toBe(true);
  expect(
    matches(
      { ...sample, updated: "2026-08-08" },
      { ...emptyFilters, period: "30" },
    ),
  ).toBe(false);
  expect(
    matches(
      { ...sample, updated: "2026-09-08" },
      { ...emptyFilters, period: "30" },
    ),
  ).toBe(false);
});
