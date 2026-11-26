import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableList } from "./index";

function Harness({ onReorder = vi.fn(), disabled = false, announce }: { onReorder?: (n: string[]) => void; disabled?: boolean; announce?: (i: string, n: number) => string }) {
  const [items, setItems] = React.useState(["a", "b", "c"]);
  return (
    <SortableList<string>
      items={items}
      getKey={(i) => i}
      disabled={disabled}
      announce={announce}
      onReorder={(n) => {
        onReorder(n);
        setItems(n);
      }}
      renderItem={(i, ctx) => (
        <div tabIndex={0} {...ctx.handleProps} data-testid={i}>
          {i}
          <button type="button" onClick={ctx.moveUp} disabled={ctx.isFirst}>{ctx.moveUpLabel} {i}</button>
          <button type="button" onClick={ctx.moveDown} disabled={ctx.isLast}>{ctx.moveDownLabel} {i}</button>
        </div>
      )}
    />
  );
}
const order = () => screen.getAllByTestId(/^[abc]$/).map((n) => n.dataset.testid);

describe("SortableList", () => {
  it("reordena por botão e anuncia", async () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);
    await userEvent.click(screen.getByRole("button", { name: "Mover para baixo a" }));
    expect(onReorder).toHaveBeenCalledWith(["b", "a", "c"]);
    expect(order()).toEqual(["b", "a", "c"]);
    expect(screen.getByRole("status").textContent).toBe("Item movido para a posição 2 de 3");
  });

  it("reordena com Alt+↑/↓ e mantém o foco no item", async () => {
    render(<Harness />);
    screen.getByTestId("c").focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(order()).toEqual(["a", "c", "b"]);
    expect(document.activeElement).toBe(screen.getByTestId("c"));
    await userEvent.keyboard("{ArrowUp}");
    expect(order()).toEqual(["a", "c", "b"]);
  });

  it("não passa dos limites, respeita disabled e o anúncio customizado", async () => {
    const onReorder = vi.fn();
    const { unmount } = render(<Harness onReorder={onReorder} announce={(i, n) => `${i} -> ${n}`} />);
    screen.getByTestId("a").focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(onReorder).not.toHaveBeenCalled();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(screen.getByRole("status").textContent).toBe("a -> 1");
    unmount();
    const spy = vi.fn();
    render(<Harness onReorder={spy} disabled />);
    screen.getByTestId("a").focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(spy).not.toHaveBeenCalled();
  });
});
