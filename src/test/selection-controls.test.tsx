import { createRef, useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Checkbox,
  Radio,
  Switch,
  Combobox,
  MultiSelect,
  DateRangeField,
  FileUpload,
} from "../index";

const options = [
  { value: "a", label: "Academy" },
  { value: "b", label: "Bloqueado", disabled: true },
  { value: "c", label: "Campanhas" },
];

describe("selection controls", () => {
  it.each([false, true])(
    "closes and blocks an open selection when disabled (multiple=%s)",
    async (multiple) => {
      const change = vi.fn();
      const fixture = (disabled: boolean) =>
        multiple ? (
          <MultiSelect
            aria-label="Canais"
            options={options}
            value={[]}
            onValueChange={change}
            disabled={disabled}
          />
        ) : (
          <Combobox
            aria-label="Canal"
            options={options}
            value=""
            onValueChange={change}
            disabled={disabled}
          />
        );
      const user = userEvent.setup();
      const { rerender } = render(fixture(false));
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      rerender(fixture(true));
      const remaining = screen.queryByRole("option", { name: "Academy" });
      if (remaining) await user.click(remaining);
      expect(change).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      rerender(fixture(false));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    }
  );
  it("announces a multi-select empty search without changing its selected count", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect
        aria-label="Canais"
        options={options}
        value={["a"]}
        onValueChange={() => undefined}
      />
    );
    await user.type(screen.getByRole("combobox"), "nothing");
    expect(
      screen
        .getAllByRole("status")
        .some((node) => node.textContent?.includes("Nenhuma opção encontrada"))
    ).toBe(true);
    expect(screen.getByText("1 selecionado")).toBeInTheDocument();
    await user.clear(screen.getByRole("combobox"));
    expect(
      screen.queryByText("Nenhuma opção encontrada")
    ).not.toBeInTheDocument();
  });
  it("exposes mixed state, forwards refs and participates in native forms", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <form aria-label="Preferências">
        <label>
          <Checkbox
            ref={ref}
            indeterminate
            name="news"
            value="yes"
            defaultChecked
          />{" "}
          Notícias
        </label>
      </form>
    );
    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    expect(ref.current).toBe(screen.getByRole("checkbox"));
    expect(
      new FormData(screen.getByRole("form") as HTMLFormElement).get("news")
    ).toBe("yes");
  });
  it("preserves native radio exclusivity and switch keyboard/disabled behavior", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label>
          <Radio name="channel" value="a" defaultChecked /> A
        </label>
        <label>
          <Radio name="channel" value="b" /> B
        </label>
        <label>
          <Switch /> Ativo
        </label>
        <label>
          <Switch disabled /> Travado
        </label>
      </>
    );
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    screen.getByRole("switch", { name: "Ativo" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("switch", { name: "Ativo" })).toBeChecked();
    await user.click(screen.getByRole("switch", { name: "Travado" }));
    expect(screen.getByRole("switch", { name: "Travado" })).not.toBeChecked();
  });
  it("navigates options, skips disabled, keeps IDs stable and never submits the parent form", async () => {
    const submit = vi.fn();
    function Fixture() {
      const [value, setValue] = useState("");
      return (
        <form onSubmit={submit}>
          <Combobox
            aria-label="Canal"
            options={options}
            value={value}
            onValueChange={setValue}
          />
        </form>
      );
    }
    const user = userEvent.setup();
    render(<Fixture />);
    const input = screen.getByRole("combobox");
    input.focus();
    await user.keyboard("{ArrowDown}");
    const firstId = screen.getByRole("option", { name: "Academy" }).id;
    expect(input).toHaveAttribute("aria-activedescendant", firstId);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Campanhas" }).id
    );
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", firstId);
    await user.keyboard("{End}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Campanhas" }).id
    );
    await user.keyboard("{Home}");
    expect(input).toHaveAttribute("aria-activedescendant", firstId);
    await user.click(screen.getByRole("option", { name: "Bloqueado" }));
    expect(input).toHaveValue("");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Academy");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowDown}{Escape}{Enter}");
    expect(submit).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "nothing");
    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma opção");
    await user.clear(input);
    expect(screen.getByRole("option", { name: "Academy" }).id).toBe(firstId);
  });
  it("keeps multi selections across searches and provides named removals and a count", async () => {
    function Fixture() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <MultiSelect
          aria-label="Canais"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    const user = userEvent.setup();
    render(<Fixture />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Acad{ArrowDown}{Enter}");
    await user.clear(input);
    await user.type(input, "Camp{ArrowDown}{Enter}");
    expect(screen.getByText("2 selecionados")).toHaveAttribute(
      "role",
      "status"
    );
    expect(
      screen.getByRole("button", { name: "Remover Academy" })
    ).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true"
    );
    await user.click(screen.getByRole("button", { name: "Remover Academy" }));
    expect(screen.getByText(/^1 selecionado$/)).toHaveAttribute(
      "role",
      "status"
    );
  });
  it("labels date endpoints and links invalid chronology to both inputs", () => {
    const change = vi.fn();
    render(
      <DateRangeField
        label="Período"
        value={{ from: "2026-09-10", to: "2026-09-01" }}
        onValueChange={change}
        min="2026-01-01"
        max="2026-12-31"
      />
    );
    const from = screen.getByLabelText("De");
    const to = screen.getByLabelText("Até");
    expect(screen.getByRole("group", { name: "Período" })).toBeInTheDocument();
    expect(from).toHaveAttribute("aria-invalid", "true");
    expect(to).toHaveAttribute(
      "aria-describedby",
      screen.getByRole("alert").id
    );
    expect(from).toHaveAttribute("min", "2026-01-01");
    fireEvent.change(to, { target: { value: "2026-09-11" } });
    expect(change).toHaveBeenCalledWith({
      from: "2026-09-10",
      to: "2026-09-11",
    });
  });
  it("bounds progress, delegates real file/cancel/retry actions and omits unavailable actions", async () => {
    const cancel = vi.fn();
    const retry = vi.fn();
    const files = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <FileUpload
        label="Anexos"
        onFilesChange={files}
        onCancel={cancel}
        onRetry={retry}
        items={[
          { id: "a", name: "a.pdf", progress: 180, status: "uploading" },
          {
            id: "b",
            name: "b.pdf",
            progress: -20,
            status: "error",
            error: "Falha de conexão",
          },
        ]}
      />
    );
    expect(screen.getByRole("progressbar", { name: "a.pdf" })).toHaveAttribute(
      "value",
      "100"
    );
    expect(screen.getByRole("progressbar", { name: "b.pdf" })).toHaveAttribute(
      "value",
      "0"
    );
    await user.click(screen.getByRole("button", { name: "Cancelar a.pdf" }));
    await user.click(
      screen.getByRole("button", { name: "Tentar novamente b.pdf" })
    );
    expect(cancel).toHaveBeenCalledWith("a");
    expect(retry).toHaveBeenCalledWith("b");
    const file = new File(["pdf"], "c.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Anexos"), file);
    expect(files).toHaveBeenCalledWith([file]);
    rerender(
      <FileUpload
        label="Anexos"
        onFilesChange={files}
        items={[{ id: "a", name: "a.pdf", progress: NaN, status: "uploading" }]}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
  });
});
