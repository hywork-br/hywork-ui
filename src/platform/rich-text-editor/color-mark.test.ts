import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import { ColorMark } from "./color-mark";

// Round-trip pelo TipTap real: define o conteúdo, lê de volta o HTML e confere se
// a cor sobrevive ao re-parse — a quebra do HCK-314 / SUP-305.
function roundTrip(html: string): string {
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: [StarterKit, ColorMark],
    content: html,
  });
  const out = editor.getHTML();
  editor.destroy();
  return out;
}

describe("ColorMark round-trip (HCK-314)", () => {
  it("preserva a cor do texto ao re-parsear (rgb, hex e nome)", () => {
    expect(roundTrip('<p><span style="color: rgb(255, 0, 0)">x</span></p>')).toMatch(
      /color/i,
    );
    expect(roundTrip('<p><span style="color: #ff0000">x</span></p>')).toMatch(/color/i);
    expect(roundTrip('<p><span style="color: red">x</span></p>')).toMatch(/color/i);
  });

  it("não adiciona cor a um span sem cor inline", () => {
    expect(roundTrip("<p><span>sem cor</span></p>")).not.toMatch(/color/i);
  });
});
