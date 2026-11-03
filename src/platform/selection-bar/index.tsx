"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";

/**
 * Ação em massa sobre a seleção de uma listagem: a contagem, o que vai ao lado
 * dela, as ações e "Limpar seleção".
 *
 * Proposta, aguardando o aval da PO (HCK-258, 03/11/2026): a forma é a da barra
 * de Bases de dados — borda na marca a 30%, fundo na marca a 5% —, só com
 * tokens. O produto tinha quatro formas para isso (ver `DOMAIN_MODEL.md`).
 *
 * Fica solta, acima da listagem, e não dentro do `DataList`: serve a qualquer
 * lista que se marque (tabela ou grade de cards), e o `DataList` não ganha
 * prop. A tela liga as duas pelo mesmo estado de seleção.
 *
 * **A listagem não pula.** Sem seleção, a barra fica invisível no lugar dela:
 * o espaço é o da própria barra, e não um número fixo. Com `persistent`, fica à
 * vista com as ações desabilitadas.
 */
export interface SelectionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Quantos itens estão selecionados. Com 0, a barra some (guardando o lugar)
   * e as ações ficam desabilitadas.
   */
  count: number;
  /**
   * O texto da contagem, escrito pela tela: "3 selecionadas", "Todas as 57
   * pendências selecionadas", "3 selecionadas · 2 neste filtro". É anunciado a
   * cada mudança, inclusive ao chegar a 0 — então vale ter texto também aí
   * ("Nenhuma selecionada").
   */
  label: React.ReactNode;
  /**
   * Ao lado da contagem: "Selecionar todas as 57" (um `Button variant="link"`,
   * que a barra alinha ao texto) ou uma nota curta que explique uma ação
   * desabilitada — dê a ela um `id` e ligue ao botão por `aria-describedby`.
   */
  detail?: React.ReactNode;
  /**
   * As ações sobre a seleção — botões do design system, `size="sm"`; a
   * destrutiva em `variant="destructive"`. Ficam desabilitadas sozinhas quando
   * `count` é 0. O que não depende da seleção não entra aqui.
   */
  children?: React.ReactNode;
  onClear: () => void;
  /** Texto do botão de limpar. Padrão: "Limpar seleção". */
  clearLabel?: React.ReactNode;
  /**
   * Fica à vista sem seleção: a contagem diz que nada está selecionado, as
   * ações aparecem desabilitadas e "Limpar seleção" não aparece. Para a tela
   * em que a ação é fixa, como "Exportar selecionados".
   */
  persistent?: boolean;
  /** Nome do grupo de ações, para o leitor de tela. Padrão: "Ações da seleção". */
  "aria-label"?: string;
}

const SelectionBar = React.forwardRef<HTMLDivElement, SelectionBarProps>(
  (
    {
      count,
      label,
      detail,
      children,
      onClear,
      clearLabel = "Limpar seleção",
      persistent = false,
      "aria-label": ariaLabel = "Ações da seleção",
      className,
      ...props
    },
    ref,
  ) => {
    const ativa = count > 0;
    const escondida = !ativa && !persistent;

    const raiz = React.useRef<HTMLDivElement>(null);
    const moldura = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => raiz.current as HTMLDivElement);

    // Ao limpar, o botão em foco some. O foco vai para a raiz da barra, que fica
    // logo acima da listagem: o Tab seguinte chega à lista, e não ao topo da
    // página. Vale também quando a tela zera a seleção depois de uma ação.
    const focoNaRaiz = () => raiz.current?.focus({ preventScroll: true });
    const ativaAntes = React.useRef(ativa);
    React.useLayoutEffect(() => {
      if (ativaAntes.current && !ativa && moldura.current?.contains(document.activeElement)) focoNaRaiz();
      ativaAntes.current = ativa;
    }, [ativa]);

    const limpar = () => {
      focoNaRaiz();
      onClear();
    };

    return (
      <div ref={raiz} tabIndex={-1} className={cn("mb-4 outline-none", className)} {...props}>
        {/* A contagem anunciada. Fica sempre montada — região viva que nasce
            junto com o texto não é lida —, e fora da moldura, que some. */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {label}
        </div>

        <div
          ref={moldura}
          role="group"
          aria-label={ariaLabel}
          aria-hidden={escondida || undefined}
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-md border px-3 py-2",
            ativa ? "border-primary/30 bg-primary/5" : "border-transparent",
            escondida && "invisible",
          )}
        >
          {/* Abaixo de 640px a contagem tem a sua faixa, com duas linhas
              guardadas (2 × 20px), e as ações vão para a linha de baixo: a
              altura não depende do texto da tela — "6 selecionadas" com
              "Selecionar todas as 57" ao lado quebra em duas linhas, "Todas as 57
              pendências selecionadas" cabe numa. A partir de 640px, uma linha só. */}
          <div className="flex min-h-10 min-w-0 basis-full flex-wrap content-center items-center gap-x-3 sm:mr-auto sm:min-h-0 sm:basis-auto">
            {/* O leitor de tela já ouve a contagem pela região viva. */}
            <p aria-hidden="true" className="text-sm font-medium">
              {label}
            </p>
            {detail ? (
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 text-sm text-muted-foreground [&>button]:h-auto [&>button]:px-0">
                {detail}
              </div>
            ) : null}
          </div>

          {/* Sem seleção, o fieldset desabilita todas as ações de uma vez. Só
              isso: `role="none"` tira o segundo grupo, sem nome, do leitor de tela. */}
          <fieldset role="none" disabled={!ativa} className="m-0 flex min-w-0 flex-wrap items-center gap-2 border-0 p-0">
            {children}
          </fieldset>

          {/* Sem seleção não há o que limpar. Na barra à vista (`persistent`) o
              botão sai, como o "Limpar" da FilterBar; na barra escondida ele
              continua no lugar, invisível, para a altura ser a da barra aberta. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limpar}
            disabled={!ativa}
            className={cn(!ativa && (persistent ? "hidden" : "invisible"))}
          >
            <X className="mr-1 size-4" aria-hidden="true" />
            {clearLabel}
          </Button>
        </div>
      </div>
    );
  },
);
SelectionBar.displayName = "SelectionBar";

export { SelectionBar };
