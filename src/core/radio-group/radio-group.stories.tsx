import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "./index";

const meta = {
  title: "Core/RadioGroup",
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Uma escolha entre poucas opções, todas visíveis.
 *
 * Com mais de cinco, o `Select` cansa menos; com escolha múltipla, é `Checkbox`.
 */
export const Padrao: Story = {
  render: () => (
    <RadioGroup defaultValue="todos" className="space-y-2">
      {[
        ["todos", "Todos os colaboradores"],
        ["estrutura", "Por estrutura organizacional"],
        ["lista", "Lista específica"],
      ].map(([v, l]) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem value={v} id={v} />
          <Label htmlFor={v}>{l}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};

/** Uma opção indisponível continua visível, para não esconder o que existe. */
export const ComOpcaoDesabilitada: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="space-y-2">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="ra" />
        <Label htmlFor="ra">Disponível</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="rb" disabled />
        <Label htmlFor="rb">Requer integração ativa</Label>
      </div>
    </RadioGroup>
  ),
};
