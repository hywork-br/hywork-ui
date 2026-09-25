import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./index";

const meta = { title: "Core/Table", component: Table } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A primitiva. Para listar dados numa tela, use `Platform/Padrões/DataList`:
 * ele declara as colunas e já traz carregamento e estado vazio.
 */
export const Padrao: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="text-right">Acessos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Ana Souza</TableCell>
          <TableCell>ana@empresa.com</TableCell>
          <TableCell className="text-right">128</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Bruno Lima</TableCell>
          <TableCell>bruno@empresa.com</TableCell>
          <TableCell className="text-right">64</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Larga demais para a tela: rola dentro do próprio container. */
export const Larga: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <Table style={{ minWidth: 700 }}>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Unidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana Souza</TableCell>
            <TableCell>ana@empresa.com</TableCell>
            <TableCell>Analista</TableCell>
            <TableCell>Matriz</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
