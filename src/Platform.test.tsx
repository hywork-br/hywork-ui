import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Button, Input, Slider, buttonVariants } from "./index";
describe("Platform contracts", () => {
  it("slider exposes a named thumb for the uncontrolled default", () => {
    render(<Slider aria-label="Volume" defaultValue={[40]} />);
    expect(screen.getByRole("slider",{name:"Volume"})).toHaveAttribute("aria-valuenow","40");
  });
  it("preserves original default and explicit compact sizing", () => {
    expect(buttonVariants()).toContain("h-10");
    expect(buttonVariants({size:"sm"})).toContain("h-9");
    expect(buttonVariants({variant:"outline"})).toContain("border-input");
  });
  it("disabled buttons do not submit click handlers", () => {
    const click=vi.fn();
    render(<Button disabled onClick={click}>Salvar</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(click).not.toHaveBeenCalled();
  });
  it("input invokes its handlers without propagating to the parent", () => {
    const parent=vi.fn(), change=vi.fn(), key=vi.fn(), click=vi.fn();
    const ref=createRef<HTMLInputElement>();
    render(<div onClick={parent} onKeyDown={parent}><Input ref={ref} aria-label="Nome" onClick={click} onChange={change} onKeyDown={key}/></div>);
    const input=screen.getByRole("textbox");
    fireEvent.click(input);
    fireEvent.change(input,{target:{value:"Política"}});
    fireEvent.keyDown(input,{key:"Enter"});
    expect(click).toHaveBeenCalledOnce();
    expect(change).toHaveBeenCalledOnce();
    expect(key).toHaveBeenCalledOnce();
    expect(parent).not.toHaveBeenCalled();
    expect(ref.current?.value).toBe("Política");
  });
  it("asChild preserves the consumer element", () => {
    render(<Button asChild><a href="/documentos">Documentos</a></Button>);
    expect(screen.getByRole("link")).toHaveAttribute("href","/documentos");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
