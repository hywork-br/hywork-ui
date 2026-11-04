import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

import { FileThumbnail, type FileThumbnailProps } from "./index";

// jsdom não tem layout nem carrega imagem: o corte do nome e a imagem de verdade
// são medidos no navegador (tests/browser/file-thumbnail.spec.ts). Aqui o `load` e
// o `error` são disparados à mão.
const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations;

const URL_A = "https://arquivos.exemplo/a.png?assinatura=1";
const URL_B = "https://arquivos.exemplo/a.png?assinatura=2";

const montar = (props: Partial<FileThumbnailProps> = {}) => {
  const onOpen = vi.fn();
  const view = render(<FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} {...props} />);
  return { ...view, onOpen, botao: screen.getByRole("button") };
};

/** A imagem da miniatura: `alt=""` a tira da árvore de acessibilidade. */
const img = (container: HTMLElement) => container.querySelector("img");
const icone = (container: HTMLElement) => container.querySelector("svg");
const esqueleto = (container: HTMLElement) => container.querySelector(".animate-pulse");

describe("FileThumbnail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("o botão", () => {
    it("é um botão, com o nome do arquivo como nome acessível", () => {
      const { botao } = montar({ sizeLabel: "1,2 MB" });
      expect(screen.getByRole("button", { name: "foto.png" })).toBe(botao);
      expect(botao).toHaveAttribute("type", "button");
    });

    it("o `aria-label` da tela substitui o nome", () => {
      montar({ "aria-label": "Abrir arquivo foto.png" });
      expect(screen.getByRole("button", { name: "Abrir arquivo foto.png" })).toBeInTheDocument();
    });

    it("o tamanho entra como descrição, sem mudar o nome", () => {
      const { botao } = montar({ sizeLabel: "1,2 MB" });
      expect(botao).toHaveAccessibleName("foto.png");
      expect(botao).toHaveAccessibleDescription("1,2 MB");
    });

    it("abre por clique", async () => {
      const { botao, onOpen } = montar();
      await userEvent.click(botao);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("Tab chega nele; Enter e Espaço abrem", async () => {
      const user = userEvent.setup();
      const { botao, onOpen } = montar();
      await user.tab();
      expect(botao).toHaveFocus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(onOpen).toHaveBeenCalledTimes(2);
    });

    it("desabilitado não abre nem recebe foco", async () => {
      const user = userEvent.setup();
      const { botao, onOpen } = montar({ disabled: true });
      expect(botao).toBeDisabled();
      await user.click(botao);
      await user.tab();
      expect(onOpen).not.toHaveBeenCalled();
      expect(botao).not.toHaveFocus();
    });

    it("não envia o formulário em volta", async () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <FileThumbnail name="foto.png" mime="image/png" onOpen={() => undefined} />
        </form>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("o `name` é do arquivo: não vira atributo de controle de formulário", () => {
      expect(montar().botao).not.toHaveAttribute("name");
    });

    it("repassa ref, className e atributos ao botão", () => {
      let ref: HTMLButtonElement | null = null;
      render(
        <FileThumbnail
          ref={(el) => {
            ref = el;
          }}
          name="foto.png"
          mime="image/png"
          onOpen={() => undefined}
          className="w-full"
          data-testid="miniatura"
        />,
      );
      const botao = screen.getByTestId("miniatura");
      expect(ref).toBe(botao);
      // `w-full` vence a largura padrão: uma só classe de largura chega ao DOM.
      expect(botao).toHaveClass("w-full");
      expect(botao).not.toHaveClass("w-40");
    });
  });

  describe("imagem", () => {
    it("com `src`: mostra o esqueleto até carregar e depois só a imagem", () => {
      const { container, botao } = montar({ src: URL_A });
      expect(img(container)).toHaveAttribute("src", URL_A);
      expect(img(container)).toHaveAttribute("alt", "");
      expect(esqueleto(container)).toBeInTheDocument();
      expect(botao).toHaveAttribute("data-preview", "loading");
      expect(botao).toHaveAttribute("aria-busy", "true");

      fireEvent.load(img(container)!);
      expect(esqueleto(container)).toBeNull();
      expect(icone(container)).toBeNull();
      expect(botao).toHaveAttribute("data-preview", "image");
      expect(botao).not.toHaveAttribute("aria-busy");
    });

    it("`loading` mostra o esqueleto, ainda que já haja `src`", () => {
      const { container, botao } = montar({ src: URL_A, loading: true });
      expect(esqueleto(container)).toBeInTheDocument();
      expect(img(container)).toBeNull();
      expect(icone(container)).toBeNull();
      expect(botao).toHaveAttribute("data-preview", "loading");
    });

    it("sem `src` e sem `loading`: a URL ainda não chegou, e espera", () => {
      const { container, botao } = montar();
      expect(esqueleto(container)).toBeInTheDocument();
      expect(img(container)).toBeNull();
      expect(botao).toHaveAttribute("data-preview", "loading");
    });

    it("`src` vazio é o mesmo que sem `src`", () => {
      const { container } = montar({ src: "" });
      expect(esqueleto(container)).toBeInTheDocument();
      expect(img(container)).toBeNull();
    });

    it("continua abrindo enquanto espera", async () => {
      const { botao, onOpen } = montar({ loading: true });
      await userEvent.click(botao);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("a URL chega depois: o esqueleto dá lugar à imagem", () => {
      const onOpen = vi.fn();
      const { container, rerender } = render(<FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} />);
      expect(img(container)).toBeNull();
      rerender(<FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} src={URL_A} />);
      fireEvent.load(img(container)!);
      expect(screen.getByRole("button")).toHaveAttribute("data-preview", "image");
    });

    it("`loading={false}` sem `src`: a URL não vem, e fica o ícone, sem esqueleto eterno", () => {
      const { container, botao } = montar({ loading: false });
      expect(esqueleto(container)).toBeNull();
      expect(icone(container)).toBeInTheDocument();
      expect(botao).toHaveAttribute("data-preview", "icon");
      expect(botao).not.toHaveAttribute("aria-busy");
    });

    it("imagem que falha cai no ícone do tipo", () => {
      const { container, botao } = montar({ src: URL_A });
      fireEvent.error(img(container)!);
      expect(img(container)).toBeNull();
      expect(esqueleto(container)).toBeNull();
      expect(icone(container)).toBeInTheDocument();
      expect(botao).toHaveAttribute("data-kind", "image");
      expect(botao).toHaveAttribute("data-preview", "icon");
    });

    it("depois de falhar, um `src` novo (URL renovada) tenta de novo", () => {
      const onOpen = vi.fn();
      const { container, rerender } = render(
        <FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} src={URL_A} />,
      );
      fireEvent.error(img(container)!);
      expect(img(container)).toBeNull();

      rerender(<FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} src={URL_B} />);
      expect(img(container)).toHaveAttribute("src", URL_B);
      expect(screen.getByRole("button")).toHaveAttribute("data-preview", "loading");
      fireEvent.load(img(container)!);
      expect(screen.getByRole("button")).toHaveAttribute("data-preview", "image");
    });

    it("um `src` novo depois de carregar volta a esperar", () => {
      const onOpen = vi.fn();
      const { container, rerender } = render(
        <FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} src={URL_A} />,
      );
      fireEvent.load(img(container)!);
      rerender(<FileThumbnail name="foto.png" mime="image/png" onOpen={onOpen} src={URL_B} />);
      expect(screen.getByRole("button")).toHaveAttribute("data-preview", "loading");
    });

    it("imagem que terminou antes da hidratação não fica presa no esqueleto", () => {
      vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
      vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
      const { botao } = montar({ src: URL_A });
      expect(botao).toHaveAttribute("data-preview", "image");
    });

    it("imagem que falhou antes da hidratação cai no ícone", () => {
      vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
      vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0);
      const { botao, container } = montar({ src: URL_A });
      expect(botao).toHaveAttribute("data-preview", "icon");
      expect(img(container)).toBeNull();
    });
  });

  describe("tipo do arquivo", () => {
    // Os tipos que a API aceita na evidência, e as variações de escrita.
    it.each([
      ["image/jpeg", "image"],
      ["image/png", "image"],
      ["image/webp", "image"],
      ["image/gif", "image"],
      ["IMAGE/PNG", "image"],
      ["application/pdf", "pdf"],
      ["application/pdf; charset=binary", "pdf"],
      ["video/mp4", "video"],
      ["video/quicktime", "video"],
      ["video/webm", "video"],
      ["application/zip", "other"],
      ["", "other"],
    ])("%s é %s", (mime, kind) => {
      expect(montar({ mime }).botao).toHaveAttribute("data-kind", kind);
    });

    it("cada tipo tem o seu ícone", () => {
      const classeDoIcone = (mime: string) => {
        const { container, unmount } = montar({ mime, loading: false });
        const classe = icone(container)?.getAttribute("class");
        unmount();
        return classe;
      };
      const classes = ["image/png", "application/pdf", "video/mp4", "application/zip"].map(classeDoIcone);
      expect(new Set(classes).size).toBe(4);
    });

    it.each([
      ["PDF", "application/pdf"],
      ["vídeo", "video/mp4"],
      ["outro", "application/zip"],
    ])("%s mostra o ícone e ignora `src` e `loading`", (_, mime) => {
      const { container, botao } = montar({ mime, src: URL_A, loading: true });
      expect(img(container)).toBeNull();
      expect(esqueleto(container)).toBeNull();
      expect(icone(container)).toHaveAttribute("aria-hidden", "true");
      expect(botao).toHaveAttribute("data-preview", "icon");
      expect(botao).not.toHaveAttribute("aria-busy");
    });
  });

  describe("nome e tamanho", () => {
    const longo = "comprovante-de-conclusao-do-curso-de-lideranca-situacional-turma-2026-versao-final.pdf";

    it("nome longo trunca, com o nome inteiro no `title` e no nome acessível", () => {
      const { botao } = montar({ name: longo, mime: "application/pdf" });
      const nome = screen.getByText(longo);
      expect(nome).toHaveClass("truncate");
      expect(nome).toHaveAttribute("title", longo);
      expect(botao).toHaveAccessibleName(longo);
    });

    it("mostra o tamanho que a tela formatou", () => {
      montar({ sizeLabel: "840 KB" });
      expect(screen.getByText("840 KB")).toBeVisible();
    });

    it("sem tamanho, não sobra descrição", () => {
      const { botao } = montar();
      expect(botao).not.toHaveAttribute("aria-describedby");
      expect(botao.querySelectorAll("span span")).toHaveLength(1);
    });
  });

  describe("axe", () => {
    it.each<[string, Partial<FileThumbnailProps>]>([
      ["imagem", { src: URL_A, sizeLabel: "1,2 MB" }],
      ["carregando", { loading: true }],
      ["ícone", { mime: "application/pdf", sizeLabel: "840 KB" }],
      ["desabilitado", { disabled: true }],
    ])("%s passa", async (_, props) => {
      const { container } = montar(props);
      expect(await violations(container)).toEqual([]);
    });
  });
});
