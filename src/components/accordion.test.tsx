import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

function Example(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="content">
        <AccordionTrigger>Conteúdo</AccordionTrigger>
        <AccordionContent>Detalhes do conteúdo.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="audience">
        <AccordionTrigger>Público</AccordionTrigger>
        <AccordionContent>Detalhes do público.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("keeps single mode open and exposes trigger/region relationships", async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="content" />);
    const trigger = screen.getByRole("button", { name: "Conteúdo" });
    const region = screen.getByRole("region", { name: "Conteúdo" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(region).toBeVisible();
    expect(region).toHaveAttribute("aria-labelledby", trigger.id);

    await user.click(screen.getByRole("button", { name: "Público" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Público" })).toHaveAttribute("aria-expanded", "true");
  });

  it("supports multiple mode and controlled changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example type="multiple" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Conteúdo" }));
    await user.click(screen.getByRole("button", { name: "Público" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["content", "audience"]);
  });

  it("does not collapse a non-collapsible single item", async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="content" />);
    await user.click(screen.getByRole("button", { name: "Conteúdo" }));
    expect(screen.getByRole("button", { name: "Conteúdo" })).toHaveAttribute("aria-expanded", "true");
  });

  it("composes trigger handlers without toggling when the event is prevented", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
    render(
      <Accordion>
        <AccordionItem value="content">
          <AccordionTrigger onClick={onClick}>Conteúdo</AccordionTrigger>
          <AccordionContent>Detalhes.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByRole("button", { name: "Conteúdo" });
    await user.click(trigger);

    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
