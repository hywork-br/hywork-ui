import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./index";

const meta = {
  title: "Core/Accordion",
  component: Accordion,
  // O `type` é discriminante: sem ele o Storybook não sabe qual das duas formas
  // do componente está sendo documentada.
  args: { type: "single" },
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Um aberto por vez. */
export const Padrao: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[460px]">
      <AccordionItem value="a">
        <AccordionTrigger>Quem vê esta página?</AccordionTrigger>
        <AccordionContent>Os colaboradores das estruturas selecionadas.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Posso desfazer a publicação?</AccordionTrigger>
        <AccordionContent>Sim, a página volta a rascunho.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/** Vários abertos ao mesmo tempo, para comparar seções. */
export const VariosAbertos: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["a", "b"]} className="w-[460px]">
      <AccordionItem value="a">
        <AccordionTrigger>Regras de acesso</AccordionTrigger>
        <AccordionContent>Definidas por estrutura organizacional.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Regras de aceite</AccordionTrigger>
        <AccordionContent>Exigido apenas na versão vigente.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
