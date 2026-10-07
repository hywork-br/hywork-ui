import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./index";

describe("Badge", () => {
  it("pinta o papel no tom cheio por padrão", () => {
    render(<Badge variant="positive">Ativo</Badge>);
    expect(screen.getByText("Ativo")).toHaveClass("bg-hw-status-success-fill", "text-hw-on-status");
  });

  it("no tom suave, usa o papel a 15% e a tinta do papel", () => {
    render(
      <Badge variant="positive" tone="subtle">
        Acesso configurado
      </Badge>,
    );
    const badge = screen.getByText("Acesso configurado");
    expect(badge).toHaveClass("bg-hw-status-success-fill/15", "text-hw-status-success");
    expect(badge).not.toHaveClass("bg-hw-status-success-fill", "text-hw-on-status");
  });

  it("dá tom suave aos quatro papéis com cor e aos nomes anteriores", () => {
    const cases = [
      ["attention", "bg-hw-status-warning/15"],
      ["warning", "bg-hw-status-warning/15"],
      ["negative", "bg-hw-status-danger/15"],
      ["destructive", "bg-hw-status-danger/15"],
      ["informative", "bg-hw-status-info/15"],
      ["info", "bg-hw-status-info/15"],
      ["success", "bg-hw-status-success-fill/15"],
    ] as const;

    for (const [variant, fill] of cases) {
      const { unmount } = render(
        <Badge variant={variant} tone="subtle">
          {variant}
        </Badge>,
      );
      expect(screen.getByText(variant)).toHaveClass(fill);
      unmount();
    }
  });

  it("ignora o tom onde ele não se aplica", () => {
    render(
      <Badge variant="neutral" tone="subtle">
        Inativo
      </Badge>,
    );
    expect(screen.getByText("Inativo")).toHaveClass("bg-muted", "text-muted-foreground");
  });
});
