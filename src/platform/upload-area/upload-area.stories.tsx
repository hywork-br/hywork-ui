import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";
import { UploadArea } from "./index";

const meta = {
  title: "Platform/Padrões/UploadArea",
  component: UploadArea,
  args: {
    title: "Envie o contrato assinado",
    onSelect: () => undefined,
  },
} satisfies Meta<typeof UploadArea>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O mínimo: ícone à esquerda, frase à direita. */
export const Padrao: Story = {};

/** Com a linha de apoio dizendo formatos e limite. */
export const ComDescricao: Story = {
  args: { description: "PDF ou DOCX, até 10 MB." },
};

/** Ícone próprio, quando o tipo de arquivo já é conhecido. */
export const ComIcone: Story = {
  args: { icon: <FileText />, description: "Somente PDF." },
};

/** Enquanto outro envio corre, a área não aceita novos arquivos. */
export const Desabilitada: Story = {
  args: { description: "Aguarde o envio em andamento.", disabled: true },
};
