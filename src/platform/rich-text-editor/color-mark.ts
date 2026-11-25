import { Mark } from "@tiptap/core";

// Declara o comando de cor no tipo do tiptap, como a biblioteca prevê para
// extensões próprias.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      setColor: (color: string) => ReturnType;
      unsetColor: () => ReturnType;
    };
  }
}

/**
 * Marca de cor do texto.
 *
 * O parse é feito por `tag: "span"` com cor inline, e NÃO por `{ style: "color" }`.
 * A regra baseada em `style` não re-extrai o atributo `color` ao re-parsear o HTML
 * salvo: a marca era reaplicada sem valor e o `renderHTML` devolvia um `<span>` sem
 * `style`, de modo que a cor sumia ao reselecionar o elemento no construtor e reentrar
 * no modo de edição (HCK-314 / SUP-305). Negrito, link e tamanho sobreviviam porque
 * usam regras de tag do StarterKit/Link; só a cor quebrava.
 */
export const ColorMark = Mark.create({
  name: "color",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          (element instanceof HTMLElement ? element.style.color : "").replaceAll(
            /['"]/g,
            "",
          ) || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (node) =>
          node instanceof HTMLElement && node.style.color ? {} : false,
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setColor:
        (color: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },
      unsetColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
