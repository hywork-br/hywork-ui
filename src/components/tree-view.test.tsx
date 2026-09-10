import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TreeView, type TreeNode } from "./tree-view";

const nodes: TreeNode[] = [
  {
    id: "company",
    label: "Empresa",
    children: [
      {
        id: "people",
        label: "Pessoas",
        children: [{ id: "culture", label: "Cultura" }],
      },
      {
        id: "restricted",
        label: "Restrito",
        disabled: true,
        description: "Sem permissão",
      },
    ],
  },
  { id: "operations", label: "Operações" },
];
function Example({ readOnly = false }: { readOnly?: boolean }) {
  const [expandedIds, setExpanded] = React.useState<string[]>([]);
  const [selectedId, select] = React.useState<string>();
  return (
    <TreeView
      ariaLabel="Estrutura"
      nodes={nodes}
      expandedIds={expandedIds}
      onExpandedChange={setExpanded}
      selectedId={selectedId}
      onSelectionChange={select}
      readOnly={readOnly}
    />
  );
}
describe("TreeView", () => {
  it("uses one tab stop, arrow navigation, explicit selection and nested groups", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("treeitem", { name: "Empresa" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const people = screen.getByRole("treeitem", { name: "Pessoas" });
    expect(people).toHaveFocus();
    expect(people).toHaveAttribute("aria-selected", "false");
    await user.keyboard("{Enter}");
    expect(people).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: "Cultura" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(people).toHaveFocus();
    expect(people).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "Cultura" })).toBeNull();
    expect(
      document.querySelectorAll('[role="treeitem"][tabindex="0"]')
    ).toHaveLength(1);
  });
  it("supports Home/End and Portuguese typeahead without selecting disabled nodes", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{End}");
    expect(screen.getByRole("treeitem", { name: "Operações" })).toHaveFocus();
    await user.keyboard("{Home}{ArrowRight}{ArrowDown}{ArrowDown}{Enter}");
    const restricted = screen.getByRole("treeitem", { name: "Restrito" });
    expect(restricted).toHaveFocus();
    expect(restricted).toHaveAttribute("aria-disabled", "true");
    expect(restricted).toHaveAccessibleDescription("Sem permissão");
    expect(restricted).toHaveAttribute("aria-selected", "false");
    await user.keyboard("o");
    expect(screen.getByRole("treeitem", { name: "Operações" })).toHaveFocus();
  });
  it("keeps read-only navigation usable but never requests selection", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    render(
      <TreeView
        ariaLabel="Camadas"
        nodes={nodes}
        expandedIds={["company"]}
        onExpandedChange={vi.fn()}
        onSelectionChange={select}
        readOnly
      />
    );
    await user.click(screen.getByRole("treeitem", { name: "Pessoas" }));
    await user.keyboard("{Enter}");
    expect(select).not.toHaveBeenCalled();
  });
  it("returns focus to the visible ancestor after a controlled collapse", async () => {
    const user = userEvent.setup();
    const props = {
      ariaLabel: "Pastas",
      nodes,
      onExpandedChange: vi.fn(),
      onSelectionChange: vi.fn(),
    };
    const { rerender } = render(
      <TreeView {...props} expandedIds={["company"]} />
    );
    await user.click(screen.getByRole("treeitem", { name: "Pessoas" }));
    rerender(<TreeView {...props} expandedIds={[]} />);
    expect(screen.getByRole("treeitem", { name: "Empresa" })).toHaveFocus();
    expect(
      document.querySelectorAll('[role="treeitem"][tabindex="0"]')
    ).toHaveLength(1);
  });
  it("rejects duplicate IDs rather than silently sharing focus or selection", () => {
    expect(() =>
      render(
        <TreeView
          ariaLabel="Pastas"
          nodes={[nodes[0], nodes[0]]}
          expandedIds={[]}
          onExpandedChange={vi.fn()}
          onSelectionChange={vi.fn()}
        />
      )
    ).toThrow("unique");
  });
});
