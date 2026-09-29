import { describe, expect, it } from "vitest";

import RichTextEditorDefault, { RichTextEditor } from "./index";

// O editor depende de medidas de layout que o jsdom não tem; aqui garantimos
// o contrato de import que as telas usam (dinâmico, pelo default).
describe("RichTextEditor", () => {
  it("expõe o mesmo componente como default e nomeado", () => {
    expect(RichTextEditorDefault).toBe(RichTextEditor);
  });
});
