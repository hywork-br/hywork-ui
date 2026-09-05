import { createElement, type ComponentType } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  AssinaturasEmail,
  TvCorporativa,
} from "../../stories/FeaturePilots.stories";

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, "", "/");
});
it("keeps screen counts and placement in the TV table", () => {
  render(createElement(TvCorporativa.render as ComponentType));
  const table = screen.getByRole("table", { name: "Canais de TV corporativa" });
  expect(
    within(table).getByRole("columnheader", { name: "Telas" })
  ).toBeInTheDocument();
  expect(within(table).getByRole("cell", { name: "18" })).toBeInTheDocument();
  expect(
    within(table).getByRole("cell", { name: "Recepção" })
  ).toBeInTheDocument();
});
it("keeps the signature's assigned audience count next to its preview", () => {
  render(createElement(AssinaturasEmail.render as ComponentType));
  expect(screen.getByText("32 pessoas")).toBeInTheDocument();
});

it("filters TV by screen count and exposes the active criterion", async () => {
  const user = userEvent.setup();
  render(createElement(TvCorporativa.render as ComponentType));
  await user.click(screen.getByRole("button", { name: "Mais filtros" }));
  await user.click(
    screen.getByRole("combobox", { name: "Quantidade de telas" })
  );
  await user.click(screen.getByRole("option", { name: "Até 5" }));
  await user.keyboard("{Escape}");
  const table = screen.getByRole("table", { name: "Canais de TV corporativa" });
  expect(within(table).getAllByRole("row")).toHaveLength(2);
  expect(within(table).getByRole("cell", { name: "4" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Remover Telas: Até 5" })
  ).toBeInTheDocument();
  expect(location.search).toContain("pilot-tv-quantity=small");
});
