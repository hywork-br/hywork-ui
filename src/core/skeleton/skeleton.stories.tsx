import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./index";

const meta = { title: "Core/Skeleton", component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Decisão da PO: blocos que imitam o formato do conteúdo, com pulso. */
export const Padrao: Story = { args: { className: "h-4 w-48" } };

/**
 * O esqueleto imita o que vai chegar — avatar redondo, duas linhas de texto —
 * em vez de um bloco genérico. É o que evita a tela pular quando os dados
 * chegam.
 */
export const ImitandoOConteudo: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

/** Numa listagem, a altura da linha de esqueleto é a da linha real. */
export const EmListagem: Story = {
  render: () => (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex h-[76px] items-center gap-4 border-b px-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="ml-auto h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  ),
};
