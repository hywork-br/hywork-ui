import { describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

import { BrandTheme, brandThemeVars, useBrandTheme } from "./index";

describe("BrandTheme", () => {
  it("marca o trecho e escreve os ganchos da cor do workspace", () => {
    render(<BrandTheme color="#434cad" data-testid="marca">conteúdo</BrandTheme>);
    const trecho = screen.getByTestId("marca");
    expect(trecho).toHaveAttribute("data-hw-brand");
    for (const [name, value] of Object.entries(brandThemeVars("#434cad")))
      expect(trecho.style.getPropertyValue(name)).toBe(value);
  });

  it("com cor inválida não escreve nada — vale a marca de fora ou o padrão", () => {
    render(<BrandTheme color="azul" data-testid="marca" />);
    const trecho = screen.getByTestId("marca");
    expect(trecho).toHaveAttribute("data-hw-brand");
    expect(trecho.style.getPropertyValue("--hw-brand-primary")).toBe("");
  });

  it("preserva o style do consumidor", () => {
    render(<BrandTheme color="#434cad" data-testid="marca" style={{ padding: 8 }} />);
    expect(screen.getByTestId("marca").style.padding).toBe("8px");
  });
});

describe("useBrandTheme", () => {
  const root = () => document.documentElement.style;

  it("escreve no <html>, troca com a cor e limpa ao desmontar", () => {
    const { rerender, unmount } = renderHook(({ color }) => useBrandTheme(color), {
      initialProps: { color: "#434cad" as string | null },
    });
    expect(root().getPropertyValue("--hw-brand-primary")).toBe(brandThemeVars("#434cad")["--hw-brand-primary"]);

    rerender({ color: "#facc15" });
    expect(root().getPropertyValue("--hw-brand-primary-foreground")).toBe("222.2 47.4% 11.2%");

    rerender({ color: null });
    expect(root().getPropertyValue("--hw-brand-primary")).toBe("");

    rerender({ color: "#434cad" });
    unmount();
    expect(root().getPropertyValue("--hw-brand-primary")).toBe("");
  });

  it("aceita outro elemento como alvo", () => {
    const alvo = document.createElement("section");
    renderHook(() => useBrandTheme("#000", alvo));
    expect(alvo.style.getPropertyValue("--hw-brand-primary")).toBe("0 0% 0%");
    expect(root().getPropertyValue("--hw-brand-primary")).toBe("");
  });
});
