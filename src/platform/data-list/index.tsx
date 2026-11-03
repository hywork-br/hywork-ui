"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Checkbox } from "../../core/checkbox";
import { Skeleton } from "../../core/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../core/table";

/**
 * Listagem de dados em tabela.
 *
 * Decisão da PO (23/09/2026): a tabela do design system. É a maior migração do
 * projeto — 44 telas listam dados hoje sem ela: 17 escrevem `<table>` cru e 27
 * montam a listagem com `div` e grid.
 *
 * As colunas são declaradas, não montadas: a tela diz quais dados mostra, e o
 * componente resolve cabeçalho, linhas, carregamento e estado vazio. Isso é o
 * que impede a próxima listagem de inventar o próprio cabeçalho.
 */
export interface DataListColumn<T> {
  /** Identificador da coluna, único na lista. */
  key: string;
  header: React.ReactNode;
  /** O que renderizar na célula desta coluna, para cada item. */
  cell: (item: T) => React.ReactNode;
  /** Largura fixa da coluna, quando o conteúdo não deve ditá-la. */
  width?: string;
  /** Alinha o conteúdo à direita — use para números e ações. */
  align?: "start" | "end";
}

/**
 * Seleção de linhas: uma coluna de caixas à esquerda e, no cabeçalho, a caixa
 * que marca as linhas visíveis.
 *
 * É controlada: a tela guarda as chaves (as de `getKey`) e recebe o conjunto
 * novo a cada mudança. Guardar é da tela porque só ela sabe o que vale entre
 * páginas e filtros — a caixa do cabeçalho cuida das linhas de `items` e
 * preserva as chaves que não estão em tela. "Selecionar todas as N" (todas as
 * que batem com o filtro, em todas as páginas) é da tela.
 *
 * Um objeto só, e não cinco props soltas: a seleção liga ou desliga inteira, e
 * o rótulo de cada caixa não pode faltar quando ela está ligada.
 */
export interface DataListSelection<T> {
  /** Chaves marcadas. Pode conter chaves de outras páginas: ficam intactas. */
  selectedKeys: ReadonlySet<string>;
  /** Recebe o conjunto novo — um `Set` novo, nunca o recebido alterado. */
  onChange: (keys: Set<string>) => void;
  /**
   * Rótulo acessível da caixa de cada linha: "Selecionar Ana Souza". Sem ele a
   * coluna vira uma fileira de "caixa de seleção" sem nome no leitor de tela.
   */
  getLabel: (item: T) => string;
  /** Rótulo acessível da caixa do cabeçalho. Padrão: "Selecionar todas as linhas". */
  selectAllLabel?: string;
  /**
   * A linha que não pode ser marcada mostra a caixa desabilitada, e a caixa do
   * cabeçalho a ignora ao marcar e ao calcular o estado misto.
   */
  isSelectable?: (item: T) => boolean;
}

/** Largura da coluna de seleção: o respiro de 24px da célula e a caixa de 16px. */
const LARGURA_SELECAO = 40;

/** A célula de seleção cola a caixa à coluna seguinte e encolhe até ela. */
const CELULA_SELECAO = "w-px pr-0";

/**
 * O clique na própria caixa é dela: o Radix marca e chama `onCheckedChange`.
 * O que a célula trata é o clique em volta, no respiro — é o que faz a célula
 * inteira de alvo, em vez dos 16px da caixa.
 */
function cliqueForaDaCaixa(event: React.MouseEvent<HTMLElement>) {
  return !(event.target as Element).closest("[role=checkbox]");
}

export interface DataListProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  items: T[];
  columns: DataListColumn<T>[];
  /** Chave estável de cada item. */
  getKey: (item: T) => string;
  /** Enquanto verdadeiro, mostra linhas de esqueleto no lugar dos dados. */
  loading?: boolean;
  /** Quantas linhas de esqueleto mostrar durante o carregamento. */
  loadingRows?: number;
  /** O que mostrar quando não há itens — normalmente um EmptyState. */
  empty?: React.ReactNode;
  /**
   * O que mostrar quando a carga falhou — normalmente um ErrorState. Tem
   * precedência sobre `empty`: sem dados por erro não é o mesmo que sem dados
   * por resultado, e as duas frases não podem sair pela mesma boca.
   */
  error?: React.ReactNode;
  /**
   * Altura fixa da linha, como classe (`"h-[76px]"`).
   *
   * Vale para o esqueleto e para a linha de dados ao mesmo tempo, que é o
   * ponto: é o que impede a listagem de pular quando os dados chegam. Sem ela,
   * a altura vem do conteúdo e o esqueleto quase sempre sai mais baixo.
   */
  rowHeight?: string;
  /** Torna a linha inteira clicável. */
  onRowClick?: (item: T) => void;
  /**
   * Largura mínima da tabela, para listagens largas demais para a tela. Abaixo
   * dela a tabela rola na horizontal dentro do próprio container, em vez de
   * espremer as colunas ou fazer a página inteira rolar.
   *
   * Seis listagens do produto declaravam isso por conta, cada uma com um valor
   * próprio (760, 860, 900, 920, 980), alcançando o `wrapperClassName` do
   * primitivo. Passou a ser uma porta só.
   */
  minWidth?: string;
  /**
   * Linhas pares em cinza claro. Ligado por padrão, como no `Table` (Rick,
   * 06/10/2026). Desligue só onde a linha já tem fundo próprio por estado.
   */
  striped?: boolean;
  /**
   * Liga a coluna de caixas de seleção. Ver `DataListSelection`.
   *
   * A linha marcada fica no cinza de seleção da tabela (`--hw-table-selected`),
   * que vence a listra e o cursor. O clique na coluna de seleção nunca dispara
   * `onRowClick`. Enquanto carrega, as linhas não têm caixa e a do cabeçalho
   * fica desabilitada; vazio e erro não montam a tabela.
   */
  selection?: DataListSelection<T>;
  /** Rótulo acessível da tabela. */
  "aria-label"?: string;
}

function DataList<T>({
  items,
  columns,
  getKey,
  loading = false,
  loadingRows = 5,
  empty,
  error,
  onRowClick,
  minWidth,
  rowHeight,
  striped = true,
  selection,
  className,
  ...props
}: DataListProps<T>) {
  const falhou = !loading && Boolean(error);
  const vazio = !loading && !falhou && items.length === 0;

  // Sem nada a listar, a tabela inteira sai — cabeçalho incluído. Uma fileira
  // de títulos sobre o vazio é moldura sem quadro: anuncia colunas que não
  // existem e empurra a única frase que importa para baixo dela.
  if (falhou) return <div className={cn("w-full", className)} {...props}>{error}</div>;
  if (vazio) return <div className={cn("w-full", className)} {...props}>{empty}</div>;

  // Abaixo desta largura a tabela rola na horizontal em vez de espremer as
  // colunas — espremida, o conteúdo das células é cortado em telas menores. A
  // coluna de seleção não é coluna de conteúdo: soma a sua largura às 160 de
  // cada uma.
  const larguraMinima =
    minWidth ?? `${Math.max(columns.length, 2) * 160 + (selection ? LARGURA_SELECAO : 0)}px`;

  // A caixa do cabeçalho olha só as linhas visíveis que podem ser marcadas.
  const selecionaveis =
    selection && !loading ? items.filter((item) => selection.isSelectable?.(item) ?? true) : [];
  const marcadasEmTela = selection
    ? selecionaveis.filter((item) => selection.selectedKeys.has(getKey(item))).length
    : 0;
  const cabecalho: boolean | "indeterminate" =
    marcadasEmTela === 0 ? false : marcadasEmTela === selecionaveis.length ? true : "indeterminate";

  const marcarLinha = (chave: string, marcar: boolean) => {
    if (!selection) return;
    const proximas = new Set(selection.selectedKeys);
    if (marcar) proximas.add(chave);
    else proximas.delete(chave);
    selection.onChange(proximas);
  };

  // Marca ou desmarca as linhas em tela, sem tocar nas chaves de fora delas.
  const marcarTela = (marcar: boolean) => {
    if (!selection || selecionaveis.length === 0) return;
    const proximas = new Set(selection.selectedKeys);
    for (const item of selecionaveis) {
      if (marcar) proximas.add(getKey(item));
      else proximas.delete(getKey(item));
    }
    selection.onChange(proximas);
  };

  return (
    // `min-w-0 max-w-full`: dentro de um layout flex, sem isto o contêiner
    // cresce até a largura da tabela e a rolagem do `Table` nunca aparece —
    // quem corta é o layout da página.
    <div className={cn("w-full min-w-0 max-w-full", className)} {...props}>
      <Table aria-label={props["aria-label"]} striped={striped} style={{ minWidth: larguraMinima }}>
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead
                className={cn(CELULA_SELECAO, selecionaveis.length > 0 && "cursor-pointer")}
                onClick={(event) => {
                  if (cliqueForaDaCaixa(event)) marcarTela(cabecalho !== true);
                }}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={cabecalho}
                    disabled={selecionaveis.length === 0}
                    onCheckedChange={(marcada) => marcarTela(marcada === true)}
                    aria-label={selection.selectAllLabel ?? "Selecionar todas as linhas"}
                  />
                </div>
              </TableHead>
            )}
            {columns.map((c) => (
              <TableHead
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={c.align === "end" ? "text-right" : undefined}
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading &&
            Array.from({ length: loadingRows }).map((_, linha) => (
              <TableRow key={`esqueleto-${linha}`} className={rowHeight}>
                {/* Sem caixa: ainda não há o que marcar. A célula segura a coluna. */}
                {selection && <TableCell className={CELULA_SELECAO} />}
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!loading &&
            items.map((item) => {
              const chave = getKey(item);
              const marcada = selection?.selectedKeys.has(chave) ?? false;
              const selecionavel = selection ? (selection.isSelectable?.(item) ?? true) : false;
              return (
                <TableRow
                  key={chave}
                  data-state={marcada ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={cn(rowHeight, onRowClick && "cursor-pointer")}
                >
                  {selection && (
                    <TableCell
                      className={cn(CELULA_SELECAO, selecionavel && "cursor-pointer")}
                      onClick={(event) => {
                        // A coluna de seleção nunca abre a linha — nem pela
                        // caixa, nem pelo respiro em volta dela.
                        event.stopPropagation();
                        if (selecionavel && cliqueForaDaCaixa(event)) marcarLinha(chave, !marcada);
                      }}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={marcada}
                          disabled={!selecionavel}
                          onCheckedChange={(valor) => marcarLinha(chave, valor === true)}
                          aria-label={selection.getLabel(item)}
                        />
                      </div>
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={c.align === "end" ? "text-right" : undefined}
                    >
                      {c.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
DataList.displayName = "DataList";

export { DataList };
