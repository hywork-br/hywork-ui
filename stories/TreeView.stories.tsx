import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Folder, Users } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { TreeView, type TreeNode } from "../src";

const folders: TreeNode[] = [
  {
    id: "company",
    label: "Empresa",
    icon: <Folder />,
    children: [
      {
        id: "people",
        label: "Pessoas",
        icon: <Users />,
        children: [
          {
            id: "culture",
            label: "Cultura e formas de trabalhar",
            icon: <FileText />,
          },
        ],
      },
      {
        id: "restricted",
        label: "Documentos restritos",
        description: "Sem permissão neste perfil",
        disabled: true,
        icon: <Folder />,
      },
    ],
  },
  { id: "operations", label: "Operações", icon: <Folder /> },
];
function Example({
  readOnly = false,
  nodes = folders,
}: {
  readOnly?: boolean;
  nodes?: TreeNode[];
}) {
  const [expandedIds, setExpanded] = React.useState<string[]>(["company"]);
  const [selectedId, select] = React.useState<string>();
  return (
    <div style={{ maxWidth: "28rem" }}>
      <TreeView
        ariaLabel="Pastas da empresa"
        nodes={nodes}
        expandedIds={expandedIds}
        onExpandedChange={setExpanded}
        selectedId={selectedId}
        onSelectionChange={select}
        readOnly={readOnly}
      />
      <p role="status">
        {selectedId
          ? `Selecionado: ${selectedId}`
          : "Selecione um item para ver seus detalhes."}
      </p>
    </div>
  );
}
const meta = {
  title: "Components/TreeView",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Navigation: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const people = canvas.getByRole("treeitem", { name: "Pessoas" });
    await userEvent.click(people);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await expect(
      canvas.getByRole("treeitem", { name: "Cultura e formas de trabalhar" })
    ).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Selecionado: culture"
    );
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(people).toHaveAttribute("aria-expanded", "false");
  },
};
export const ReadOnly: Story = { render: () => <Example readOnly /> };
export const LongLabels: Story = {
  render: () => (
    <Example
      nodes={[
        {
          id: "long",
          label:
            "Políticas e documentos de integração das equipes de operações em todas as unidades",
          children: [
            {
              id: "file",
              label:
                "procedimentos_de_integracao_com_nome_extenso_para_validar_quebra_em_dispositivos_moveis.pdf",
            },
          ],
        },
      ]}
    />
  ),
};
export const Empty: Story = {
  render: () => (
    <div>
      <TreeView
        ariaLabel="Pastas da empresa"
        nodes={[]}
        expandedIds={[]}
        onExpandedChange={() => {}}
        onSelectionChange={() => {}}
      />
      <p>Nenhuma pasta. Crie uma pasta na área de documentos.</p>
    </div>
  ),
};
