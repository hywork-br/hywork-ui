import { createElement, type ComponentType } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { CriacaoDeCampanha } from "../../stories/FocusMode.stories";

it("moves through actual campaign steps, preserves content, and saves only a local draft", async () => {
  const user = userEvent.setup();
  render(createElement(CriacaoDeCampanha.render as ComponentType));
  await user.click(screen.getByRole("button", { name: "Criar campanha" }));
  expect(
    screen.getByRole("heading", { name: "Escolha o canal" })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Continuar para público" })
  );
  expect(
    screen.getByRole("heading", { name: "Quem deve receber?" })
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Continuar para conteúdo" })
  );
  await user.type(
    screen.getByRole("textbox", { name: "Título da campanha" }),
    "Semana da cultura"
  );
  await user.type(
    screen.getByRole("textbox", { name: "Mensagem" }),
    "Vamos construir esta semana juntos."
  );
  await user.click(screen.getByRole("button", { name: "Revisar campanha" }));
  expect(
    screen.getByRole("heading", { name: "Revise seu rascunho" })
  ).toBeInTheDocument();
  expect(screen.getByText("Semana da cultura")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Voltar" }));
  expect(
    screen.getByRole("textbox", { name: "Título da campanha" })
  ).toHaveValue("Semana da cultura");
  await user.click(screen.getByRole("button", { name: "Revisar campanha" }));
  await user.click(
    screen.getByRole("button", { name: "Salvar rascunho local" })
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Rascunho salvo nesta demonstração"
  );
  expect(screen.getByRole("button", { name: "Criar campanha" })).toHaveFocus();
});
