import { createElement, type ComponentType } from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  Academy,
  AssinaturasEmail,
  Conteudos,
  TvCorporativa,
} from "../../stories/FeaturePilots.stories";

function mount(story: { render?: unknown }) {
  return render(createElement(story.render as ComponentType));
}

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("reference feature journeys", () => {
  it("saves a named Academy draft and restores it after the pilot remounts", async () => {
    const user = userEvent.setup();
    mount(Academy);
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome do curso" }),
      "Integração de equipes"
    );
    await user.click(
      screen.getByRole("button", { name: "Salvar rascunho e voltar" })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole("heading", { name: "Integração de equipes" })
    ).toBeInTheDocument();
    cleanup();
    mount(Academy);
    await user.click(
      screen.getByRole("button", { name: "Editar Integração de equipes" })
    );
    expect(screen.getByRole("textbox", { name: "Nome do curso" })).toHaveValue(
      "Integração de equipes"
    );
  });

  it("keeps data on a failed save, supports retry, and creates only one item", async () => {
    const user = userEvent.setup();
    mount(Academy);
    await user.click(screen.getByText("Cenários de demonstração"));
    await user.click(
      screen.getByRole("checkbox", { name: "Falhar próximo salvamento" })
    );
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome do curso" }),
      "Curso recuperado"
    );
    await user.dblClick(
      screen.getByRole("button", { name: "Salvar rascunho e voltar" })
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Seus dados continuam aqui"
    );
    expect(screen.getByRole("textbox", { name: "Nome do curso" })).toHaveValue(
      "Curso recuperado"
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(
      screen.getAllByRole("heading", { name: "Curso recuperado" })
    ).toHaveLength(1);
  });

  it("confirms a dirty exit in place and discards without saving", async () => {
    const user = userEvent.setup();
    mount(Academy);
    await user.click(screen.getByRole("button", { name: "Novo curso" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome do curso" }),
      "Não salvar"
    );
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Continuar editando" })
    );
    expect(screen.getByRole("textbox", { name: "Nome do curso" })).toHaveValue(
      "Não salvar"
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(
      screen.getByRole("button", { name: "Descartar alterações" })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole("heading", { name: "Não salvar" })
    ).not.toBeInTheDocument();
  });

  it("preserves search and returns to it when an edited item stops matching", async () => {
    const user = userEvent.setup();
    mount(Academy);
    await user.type(
      screen.getByRole("textbox", { name: "Buscar em Academy" }),
      "conversas difíceis"
    );
    await user.click(
      screen.getByRole("button", {
        name: "Editar Liderança em conversas difíceis",
      })
    );
    const field = screen.getByRole("textbox", { name: "Nome do curso" });
    await user.clear(field);
    await user.type(field, "Liderança no dia a dia");
    await user.click(
      screen.getByRole("button", { name: "Salvar alterações e voltar" })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const search = screen.getByRole("textbox", { name: "Buscar em Academy" });
    expect(search).toHaveValue("conversas difíceis");
    expect(window.location.search).toContain(
      "pilot-academy-search=conversas+dif%C3%ADceis"
    );
    expect(
      screen.queryByRole("heading", { name: "Liderança no dia a dia" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "fora dos filtros atuais"
    );
    await waitFor(() => expect(search).toHaveFocus());
    await user.click(
      screen.getByRole("button", { name: "Limpar busca e filtros" })
    );
    expect(
      screen.getByRole("heading", { name: "Liderança no dia a dia" })
    ).toBeInTheDocument();
  });

  it("uses editorial status vocabulary in the Content filter and table", async () => {
    const user = userEvent.setup();
    mount(Conteudos);
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    expect(
      screen.queryByRole("option", { name: "Ativa" })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: /^Publicado$/ }));
    const table = screen.getByRole("table", { name: "Conteúdos publicados" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("Publicado")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remover Publicado" })
    ).toBeInTheDocument();
  });

  it.each([
    [TvCorporativa, "Novo canal", "Nome do canal", "Canal piloto"],
    [
      AssinaturasEmail,
      "Nova assinatura",
      "Nome da assinatura",
      "Assinatura piloto",
    ],
    [Conteudos, "Novo conteúdo", "Título do conteúdo", "Conteúdo piloto"],
  ])(
    "creates a domain-specific draft in the reference collection",
    async (story, action, label, name) => {
      const user = userEvent.setup();
      mount(story);
      await user.click(screen.getByRole("button", { name: action }));
      await user.type(screen.getByRole("textbox", { name: label }), name);
      await user.click(
        screen.getByRole("button", { name: "Salvar rascunho e voltar" })
      );
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      expect(
        screen.getByRole("button", { name: `Editar ${name}` })
      ).toBeInTheDocument();
    }
  );
});
