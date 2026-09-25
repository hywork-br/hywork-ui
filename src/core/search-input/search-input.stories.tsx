import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from "./index";

const meta = {
  title: "Core/SearchInput",
  component: SearchInput,
  args: { value: "", onChange: () => undefined, placeholder: "Buscar colaborador" },
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Em repouso: lupa à esquerda, raio total, altura 40. */
export const Padrao: Story = {};

/** Com texto, o botão de limpar aparece à direita. */
export const Preenchido: Story = { args: { value: "Ana" } };

/** Enquanto a busca corre no servidor, o campo não aceita digitação. */
export const Desabilitado: Story = { args: { value: "Ana", disabled: true } };

/** Sem o botão de limpar, quando a tela já oferece outra forma de desfazer. */
export const SemLimpar: Story = { args: { value: "Ana", clearable: false } };
