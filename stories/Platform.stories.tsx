import type { Meta, StoryObj } from "@storybook/react-vite";
import * as ui from "../src";
import { Catalog } from "./catalog";
const meta = { title: "Platform/Componentes", component: Catalog, args: { ui } } satisfies Meta<typeof Catalog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Catalogo: Story = {};
