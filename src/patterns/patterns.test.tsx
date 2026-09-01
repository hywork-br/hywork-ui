import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Button,
  DataTable,
  FilterBar,
  FocusMode,
  ListPage,
  Stepper,
} from "../index";

describe("product patterns", () => {
  it("distinguishes empty collections from filtered no-results", () => {
    const { rerender } = render(
      <ListPage
        action={<Button>Nova campanha</Button>}
        description="Planeje comunicações em todos os canais."
        empty={{ title: "Nenhuma campanha criada", action: <Button>Criar campanha</Button> }}
        items={[]}
        renderItem={() => null}
        title="Campanhas"
      />,
    );
    expect(screen.getByText("Nenhuma campanha criada")).toBeVisible();

    rerender(
      <ListPage
        activeFilterCount={2}
        description="Planeje comunicações em todos os canais."
        items={[]}
        noResults={{ title: "Nenhum resultado para estes filtros" }}
        renderItem={() => null}
        title="Campanhas"
      />,
    );
    expect(screen.getByText("Nenhum resultado para estes filtros")).toBeVisible();
  });

  it("offers one place to clear active filters", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <FilterBar
        activeFilters={[{ id: "status", label: "Status: Agendada" }]}
        onClearAll={onClear}
        search={<input aria-label="Buscar campanhas" />}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("keeps table semantics and exposes sorting as a named action", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <DataTable
        ariaLabel="Campanhas"
        columns={[
          { key: "name", header: "Campanha", sortable: true },
          { key: "status", header: "Status" },
        ]}
        getRowKey={(row) => row.name}
        onSort={onSort}
        rows={[{ name: "Boas-vindas", status: "Ativa" }]}
      />,
    );
    expect(screen.getByRole("table", { name: "Campanhas" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Ordenar por Campanha" }));
    expect(onSort).toHaveBeenCalledWith("name", "ascending");
  });

  it("gives focus mode a named exit and stepper blocks future steps", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(
      <>
        <FocusMode onExit={onExit} open title="Criar campanha">
          <Stepper
            currentStep="audience"
            steps={[
              { id: "channel", label: "Canal", status: "complete" },
              { id: "audience", label: "Público", status: "current" },
              { id: "review", label: "Revisão", status: "upcoming" },
            ]}
          />
        </FocusMode>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Sair de Criar campanha" }));
    expect(onExit).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /canal/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /público/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /revisão/i })).toBeDisabled();
  });

  it("only reopens completed steps when the consumer provides navigation", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <Stepper
        currentStep="audience"
        onStepChange={onStepChange}
        steps={[
          { id: "channel", label: "Canal", status: "complete" },
          { id: "audience", label: "Público", status: "current" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /canal/i }));
    expect(onStepChange).toHaveBeenCalledWith("channel");
    expect(screen.getByRole("button", { name: /público/i })).toBeDisabled();
  });
});
