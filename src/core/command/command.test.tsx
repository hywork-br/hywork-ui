import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// O cmdk rola a opção ativa para a vista; o jsdom não implementa isso.
Element.prototype.scrollIntoView = () => undefined;

import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./index";

describe("Command", () => {
  it("renderiza busca e opções", () => {
    render(
      <Command>
        <CommandInput placeholder="Buscar" />
        <CommandList>
          <CommandGroup>
            <CommandItem>Ana</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByPlaceholderText("Buscar")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ana" })).toBeInTheDocument();
  });
});
