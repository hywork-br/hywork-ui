import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./index";

const meta = { title: "Core/Card", component: Card } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Decisão da PO: raio 12, borda de 1px e **sem sombra** — a sombra fica
 * reservada ao que flutua (diálogo, menu, popover), não à estrutura.
 */
export const Padrao: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Campanha de integração</CardTitle>
        <CardDescription>12 colaboradores alcançados</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Começa em 3 dias e dura duas semanas.
      </CardContent>
    </Card>
  ),
};

/** Com ação no rodapé. */
export const ComAcao: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Integração com o RH</CardTitle>
        <CardDescription>Nenhuma sincronização executada.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button>Sincronizar agora</Button>
      </CardFooter>
    </Card>
  ),
};

/** Só conteúdo, sem cabeçalho — para blocos de apoio. */
export const SoConteudo: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardContent className="p-6 text-sm">
        Este espaço ainda não tem páginas publicadas.
      </CardContent>
    </Card>
  ),
};
