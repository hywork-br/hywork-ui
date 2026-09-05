import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button activation", () => {
  it.each([false, true])("preserves consumer aria-busy and lets loading prevail (asChild=%s)", (asChild) => {
    const content = asChild ? <a href="#course">Curso</a> : "Curso";
    const { rerender } = render(<Button asChild={asChild} aria-busy="true">{content}</Button>);
    const control = screen.getByRole(asChild ? "link" : "button", { name: "Curso" });
    expect(control).toHaveAttribute("aria-busy", "true");
    expect(control).not.toHaveAttribute("data-loading");
    rerender(<Button asChild={asChild} aria-busy={false}>{content}</Button>);
    expect(control).toHaveAttribute("aria-busy", "false");
    rerender(<Button asChild={asChild} aria-busy={false} loading>{content}</Button>);
    expect(control).toHaveAttribute("aria-busy", "true");
    expect(control).toHaveAttribute("data-loading", "true");
  });

  it("keeps slotted child aria-busy precedence until loading starts", () => {
    const { rerender } = render(<Button asChild aria-busy><a href="#course" aria-busy={false}>Curso</a></Button>);
    const link = screen.getByRole("link", { name: "Curso" });
    expect(link).toHaveAttribute("aria-busy", "false");
    rerender(<Button asChild aria-busy={false}><a href="#course" aria-busy>Curso</a></Button>);
    expect(link).toHaveAttribute("aria-busy", "true");
    rerender(<Button asChild loading><a href="#course" aria-busy={false}>Curso</a></Button>);
    expect(link).toHaveAttribute("aria-busy", "true");
  });

  it.each(["disabled", "loading"] as const)("blocks child and parent handlers when %s", async (state) => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <Button asChild {...{ [state]: true }} onClick={() => calls.push("parent")}>
        <a href="#blocked" onClick={() => calls.push("child")} onKeyDown={() => calls.push("key")}>
          Abrir curso
        </a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Abrir curso" });
    await user.click(link);
    link.focus();
    await user.keyboard("{Enter} ");
    expect(calls).toEqual([]);
    expect(fireEvent.click(link)).toBe(false);
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("blocks capture handlers supplied by both the child and the Button", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const record = () => calls.push("activation");
    render(
      <Button asChild loading onClickCapture={record} onPointerDownCapture={record} onKeyDownCapture={record} onKeyUpCapture={record}>
        <a href="#blocked" onClickCapture={record} onPointerDownCapture={record} onKeyDownCapture={record} onKeyUpCapture={record}>Salvar curso</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Salvar curso" });
    await user.click(link);
    link.focus();
    await user.keyboard("{Enter} ");
    expect(calls).toEqual([]);
  });

  it("preserves enabled child-first composition, capture handlers and both refs", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const parentRef = React.createRef<HTMLButtonElement>();
    const childRef = React.createRef<HTMLAnchorElement>();
    render(
      <Button asChild ref={parentRef} onClick={() => calls.push("parent")} onClickCapture={() => calls.push("parent capture")}>
        <a ref={childRef} href="#course" onClick={(event) => { event.preventDefault(); calls.push("child"); }} onClickCapture={() => calls.push("child capture")}>Curso</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Curso" });
    await user.click(link);
    expect(calls).toEqual(["child capture", "parent capture", "child", "parent"]);
    expect(parentRef.current).toBe(link);
    expect(childRef.current).toBe(link);
    calls.length = 0;
    await user.keyboard("{Enter}");
    expect(calls).toEqual(["child capture", "parent capture", "child", "parent"]);
  });

  it("retains native button keyboard and disabled semantics", async () => {
    const user = userEvent.setup();
    let count = 0;
    const { rerender } = render(<Button onClick={() => count++}>Salvar</Button>);
    await user.tab();
    await user.keyboard("{Enter} ");
    expect(count).toBe(2);
    rerender(<Button loading onClick={() => count++}>Salvar</Button>);
    const button = screen.getByRole("button", { name: "Salvar" });
    await user.click(button);
    await user.keyboard("{Enter} ");
    expect(count).toBe(2);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("keeps Tab navigation available on an unavailable slotted action", async () => {
    const user = userEvent.setup();
    render(<><Button asChild loading><a href="#course">Curso</a></Button><button>Próximo</button></>);
    await user.tab();
    expect(screen.getByRole("link", { name: "Curso" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Próximo" })).toHaveFocus();
  });

  it("does not let native disabled pointer capture execute an action", async () => {
    const user = userEvent.setup();
    let count = 0;
    render(<Button loading onPointerDownCapture={() => count++}>Salvar</Button>);
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(count).toBe(0);
  });
});
