import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./index";

const meta = { title: "Core/Spinner", component: Spinner } satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Para ação em andamento. Conteúdo carregando usa `Skeleton`. */
export const Padrao: Story = { args: { size: "md" } };
export const Pequeno: Story = { args: { size: "sm" } };
