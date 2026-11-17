"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { SearchInput, type SearchInputProps } from "../../core/search-input";

/**
 * Busca com sugestões — o padrão combobox/listbox sobre o `SearchInput`.
 *
 * O campo é o `SearchInput` do core (lupa à esquerda, altura 40, raio 4). Ao
 * digitar, abre abaixo dele a lista de sugestões; a tela filtra e passa os
 * `items`, e desenha cada um com `renderItem` (avatar e nome, ícone e nome…).
 * O componente não filtra nem sabe o que os itens são.
 *
 * Teclado: ↑/↓ movem a opção ativa (o foco fica no campo, com
 * `aria-activedescendant`), Enter escolhe a ativa ou, sem ativa, a primeira, e
 * Esc fecha a lista sem apagar o texto. Esc com a lista aberta não sobe: o
 * painel ou diálogo atrás dela continua aberto. Clicar fora fecha.
 *
 * Sem resultado, a lista fica vazia e a frase de `emptyLabel` aparece no lugar
 * dela, numa região de status. O campo segue `aria-expanded="true"` enquanto
 * algo está aberto abaixo dele: é por aí que o `ContainedSheet` sabe que o Esc
 * é da busca.
 *
 * Referência de estrutura: a busca do protótipo do organograma (HCK-435). O
 * visual é proposta, aguardando o aval da PO.
 */
export interface SearchComboboxProps<T>
  extends Pick<SearchInputProps, "placeholder" | "disabled" | "clearLabel" | "className"> {
  /** Texto do campo, controlado pela tela. */
  value: string;
  onChange: (value: string) => void;
  /** Sugestões para o texto atual, já filtradas pela tela. */
  items: readonly T[];
  /** Chave estável de cada item. */
  getKey: (item: T) => string;
  /** O conteúdo da linha; a linha (respiro, altura, fundo da ativa) é do componente. */
  renderItem: (item: T) => React.ReactNode;
  /** Chamado ao escolher, por clique ou Enter. A lista fecha; o texto fica com a tela. */
  onPick: (item: T) => void;
  /** Nome acessível do campo e da lista. */
  label: string;
  /** Frase quando nada bate com o texto (padrão: Nada encontrado para “…”.). */
  emptyLabel?: (query: string) => React.ReactNode;
}

const defaultEmpty = (query: string) => `Nada encontrado para “${query}”.`;

function SearchCombobox<T>({
  value,
  onChange,
  items,
  getKey,
  renderItem,
  onPick,
  label,
  emptyLabel = defaultEmpty,
  className,
  ...inputProps
}: SearchComboboxProps<T>) {
  const listId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const query = value.trim();
  const expanded = open && query !== "";
  const n = items.length;
  const activeIndex = expanded && active < n ? active : -1;
  const optionId = (i: number) => `${listId}-${i}`;

  React.useEffect(() => {
    if (activeIndex < 0) return;
    // A lista tem altura máxima: a opção ativa pelo teclado precisa ficar à vista.
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  const pick = (item: T) => {
    setOpen(false);
    setActive(-1);
    onPick(item);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (!expanded) return; // fechada, o Esc nativo do campo de busca limpa o texto
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (!n) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setOpen(true);
      setActive(activeIndex < 0 ? (step > 0 ? 0 : n - 1) : (activeIndex + step + n) % n);
    } else if (event.key === "Enter" && expanded) {
      event.preventDefault();
      pick(items[Math.max(0, activeIndex)]);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <SearchInput
        {...inputProps}
        value={value}
        onChange={(next) => {
          onChange(next);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // O `Input` do core não deixa o blur subir: o "clicar fora" é visto no próprio campo.
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
        onKeyDown={onKeyDown}
        aria-label={label}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={expanded}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
      />
      {expanded ? (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 min-w-[min(300px,100%)] rounded-md border bg-popover text-popover-foreground shadow-md">
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className={cn("max-h-[340px] overflow-auto", n > 0 && "p-1")}
          >
            {items.map((item, i) => (
              <div
                key={getKey(item)}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                // O foco fica no campo: sem isto, o clique tiraria o foco e fecharia a lista antes de escolher.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(item)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm p-2 text-left hover:bg-muted",
                  i === activeIndex && "bg-muted",
                )}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
          {n === 0 ? (
            <p role="status" className="m-0 p-3 text-sm text-muted-foreground">
              {emptyLabel(query)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { SearchCombobox };
