import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./index";

const meta = { title: "Core/Table", component: Table } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

const PESSOAS = [
  ["Ana Souza", "ana@empresa.com", "128"],
  ["Bruno Lima", "bruno@empresa.com", "64"],
  ["Carla Dias", "carla@empresa.com", "97"],
  ["Diego Alves", "diego@empresa.com", "12"],
  ["Elisa Prado", "elisa@empresa.com", "203"],
];

const Linhas = ({ selecionada }: { selecionada?: number }) => (
  <TableBody>
    {PESSOAS.map(([nome, email, acessos], i) => (
      <TableRow key={nome} data-state={i === selecionada ? "selected" : undefined}>
        <TableCell className="font-medium">{nome}</TableCell>
        <TableCell>{email}</TableCell>
        <TableCell className="text-right">{acessos}</TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const Cabecalho = () => (
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>E-mail</TableHead>
      <TableHead className="text-right">Acessos</TableHead>
    </TableRow>
  </TableHeader>
);

/**
 * A primitiva. Para listar dados numa tela, use `Platform/Padrões/DataList`:
 * ele declara as colunas e já traz carregamento e estado vazio.
 *
 * Linhas pares listradas por padrão (Rick, 06/10/2026). Passe o cursor: o
 * cinza do cursor (gray-100) aparece também sobre a linha listrada (gray-50).
 */
export const Padrao: Story = {
  render: () => (
    <Table>
      <Cabecalho />
      <Linhas />
    </Table>
  ),
};

/** `striped={false}`: todas as linhas no fundo da tabela. */
export const SemListras: Story = {
  render: () => (
    <Table striped={false}>
      <Cabecalho />
      <Linhas />
    </Table>
  ),
};

/**
 * Linha selecionada (`data-state="selected"`) em gray-200: vence a listra e o
 * cursor. Cabeçalho e rodapé nunca listram.
 */
export const SelecionadaComRodape: Story = {
  render: () => (
    <Table>
      <Cabecalho />
      <Linhas selecionada={1} />
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">504</TableCell>
        </TableRow>
      </TableFooter>
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
