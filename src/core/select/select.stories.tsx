import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./index";

const meta = {
  title: "Core/Select",
  component: Select,
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

const opcoes = (
  <SelectContent>
    <SelectItem value="all">Todos os status</SelectItem>
    <SelectItem value="active">Ativo</SelectItem>
    <SelectItem value="inactive">Inativo</SelectItem>
  </SelectContent>
);

/** Fechado, com o valor neutro escolhido. */
export const Padrao: Story = {
  render: () => (
    <Select defaultValue="all">
      <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
      {opcoes}
    </Select>
  ),
};

/** Nada escolhido ainda: o placeholder ocupa o lugar do valor. */
export const Vazio: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]"><SelectValue placeholder="Selecione" /></SelectTrigger>
      {opcoes}
    </Select>
  ),
};

/** Com rótulo, como aparece num formulário. */
export const ComRotulo: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="status">Status</Label>
      <Select defaultValue="active">
        <SelectTrigger id="status" className="w-[220px]"><SelectValue /></SelectTrigger>
        {opcoes}
      </Select>
    </div>
  ),
};

/** Indisponível — por exemplo enquanto a lista de opções carrega. */
export const Desabilitado: Story = {
  render: () => (
    <Select defaultValue="all" disabled>
      <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
      {opcoes}
    </Select>
  ),
};
