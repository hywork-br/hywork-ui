import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Avatar, AvatarFallback, avatarToneFor } from "./index";

describe("Avatar", () => {
  it("sem tom, mantém o fundo neutro de sempre", () => {
    render(<Avatar><AvatarFallback>AB</AvatarFallback></Avatar>);
    const f = screen.getByText("AB");
    expect(f.className).toContain("bg-muted");
    expect(f).not.toHaveAttribute("data-tone");
  });

  it("aplica fundo suave e texto no papel do tom", () => {
    render(<Avatar><AvatarFallback tone="success">AB</AvatarFallback></Avatar>);
    const f = screen.getByText("AB");
    expect(f).toHaveAttribute("data-tone", "success");
    expect(f.className).toContain("bg-hw-status-success-fill/15");
    expect(f.className).toContain("text-hw-status-success");
    expect(f.className).not.toContain("bg-muted");
  });

  it("avatarToneFor é determinístico e fica nos cinco papéis", () => {
    expect(avatarToneFor("pessoa-1")).toBe(avatarToneFor("pessoa-1"));
    const tons = new Set(Array.from({ length: 50 }, (_, i) => avatarToneFor(`id-${i}`)));
    expect([...tons].every((t) => ["primary", "info", "success", "warning", "danger"].includes(t))).toBe(true);
    expect(tons.size).toBeGreaterThan(1);
    expect(avatarToneFor("")).toBeTruthy();
  });
});
