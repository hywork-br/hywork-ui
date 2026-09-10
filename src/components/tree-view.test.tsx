import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    await user.click(screen.getByText("Pessoas"));
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
    await user.click(screen.getByText("Pessoas"));
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
  it("does not select an ancestor when the empty child-group area is clicked", () => {
    const select = vi.fn();
    render(
      <TreeView
        ariaLabel="Pastas"
        nodes={nodes}
        expandedIds={["company"]}
        onExpandedChange={vi.fn()}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByRole("group"));
    expect(select).not.toHaveBeenCalled();
  });
  it.each([
    { id: "blocked", label: "Blocked", disabled: true },
    {
      id: "blocked",
      label: "Blocked",
      disabled: true,
      description: "Unavailable",
      children: [{ id: "child", label: "Child" }],
    },
  ])(
    "rejects unavailable nodes without a reason or with descendants",
    (invalid) => {
      expect(() =>
        render(
          <TreeView
            ariaLabel="Pastas"
            nodes={[invalid as unknown as TreeNode]}
            expandedIds={[]}
            onExpandedChange={vi.fn()}
            onSelectionChange={vi.fn()}
          />
        )
      ).toThrow("disabled leaves require a reason");
    }
  );
  it("recovers focus after node removal but does not steal focus from outside", async () => {
    const user = userEvent.setup();
    const props = {
      ariaLabel: "Pastas",
      onExpandedChange: vi.fn(),
      onSelectionChange: vi.fn(),
      expandedIds: ["company"],
    };
    const reduced: TreeNode[] = [{ id: "company", label: "Empresa" }];
    const { rerender } = render(
      <>
        <button>Fora da árvore</button>
        <TreeView {...props} nodes={nodes} />
      </>
    );
    await user.click(screen.getByText("Pessoas"));
    rerender(
      <>
        <button>Fora da árvore</button>
        <TreeView {...props} nodes={reduced} />
      </>
    );
    expect(screen.getByRole("treeitem", { name: "Empresa" })).toHaveFocus();
    rerender(
      <>
        <button>Fora da árvore</button>
        <TreeView {...props} nodes={nodes} />
      </>
    );
    await user.click(screen.getByText("Pessoas"));
    await user.click(screen.getByRole("button", { name: "Fora da árvore" }));
    rerender(
      <>
        <button>Fora da árvore</button>
        <TreeView {...props} nodes={reduced} />
      </>
    );
    expect(
      screen.getByRole("button", { name: "Fora da árvore" })
    ).toHaveFocus();
  });
});
