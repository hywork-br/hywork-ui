import type { Meta, StoryObj } from "@storybook/react-vite";
import * as ui from "../../src/core";
import { Catalog } from "../catalog";

/**
 * Folha de amostras do teste de paridade — **não é o catálogo**.
 *
 * O catálogo são as páginas de `Core/` e `Padrões/`, uma por componente, com os
 * estados que cada um precisa resolver. Esta aqui é o alvo do teste visual:
 * a mesma folha é renderizada com a implementação atual e com a referência
 * congelada em `provenance/`, e as duas imagens são comparadas pixel a pixel.
 *
 * Ela está aqui para quando esse teste falhar e alguém precisar ver o que mudou.
 * Não use como referência de uso: não tem todos os componentes e não mostra os
 * padrões autorais, que não existem na referência.
 */
const meta = {
  title: "Interno/Paridade visual",
  component: Catalog,
  args: { ui },
} satisfies Meta<typeof Catalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FolhaDeAmostras: Story = {};
