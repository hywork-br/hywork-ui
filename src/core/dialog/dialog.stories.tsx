import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./index";

const meta = { title: "Core/Dialog", component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Decisão da PO: largura ampla, altura máxima de 90% da tela, rolagem interna.
 *
 * **O rodapé nunca tem botão de largura total.** Por mais largo que fique o
 * diálogo, a ação principal mantém a altura e o respiro de qualquer outro botão.
 * Ordem: secundária à esquerda da principal.
 */
export const Padrao: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo colaborador</DialogTitle>
          <DialogDescription>Ele recebe um convite por e-mail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" placeholder="ana@empresa.com" />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Convidar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** Conteúdo longo: o diálogo para de crescer e rola por dentro. */
export const ComRolagem: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader><DialogTitle>Termos</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i}>Parágrafo {i + 1} do documento que o colaborador precisa aceitar.</p>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline">Recusar</Button>
          <Button>Aceitar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
