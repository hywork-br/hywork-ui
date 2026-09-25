import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "../button";
import { Alert, AlertDescription, AlertTitle } from "./index";

const meta = {
  title: "Core/Alert",
  component: Alert,
  args: {
    children: (
      <>
        <Info className="h-4 w-4" />
        <AlertTitle>Sincronização agendada</AlertTitle>
        <AlertDescription>Os colaboradores entram na próxima execução.</AlertDescription>
      </>
    ),
  },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Informativo: sem juízo de valor. */
export const Informativo: Story = { args: { variant: "info" } };

/** Algo deu certo. */
export const Sucesso: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Importação concluída</AlertTitle>
        <AlertDescription>142 colaboradores entraram.</AlertDescription>
      </>
    ),
  },
};

/** Vale a atenção, mas nada quebrou. */
export const Atencao: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Esta ação não pode ser desfeita</AlertTitle>
      </>
    ),
  },
};

/** Falhou. */
export const Erro: Story = {
  args: {
    variant: "error",
    children: (
      <>
        <XCircle className="h-4 w-4" />
        <AlertTitle>12 linhas não puderam ser importadas</AlertTitle>
      </>
    ),
  },
};

/** Com ação à direita, na mesma linha do texto. */
export const ComAcao: Story = {
  args: {
    variant: "error",
    action: <Button variant="outline">Baixar erros</Button>,
    children: (
      <>
        <AlertTitle>12 linhas não puderam ser importadas</AlertTitle>
        <AlertDescription>O relatório traz a linha e o motivo.</AlertDescription>
      </>
    ),
  },
};
