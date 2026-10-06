"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";
import { SearchInput } from "../../core/search-input";
import { Label } from "../../core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../core/select";

/**
 * Barra de filtros de listagem.
 *
 * Anatomia fixa, na ordem: busca → dimensões → ação de limpar. A página decide
 * quantos campos existem e de que tipo; nunca como a barra é desenhada.
 *
 * Convenção de "filtro ativo": para `Search`, texto não vazio. Para `Select` e
 * `Chips`, valor diferente da PRIMEIRA opção — ela é sempre a neutra ("Todos").
 * A ação de limpar só aparece quando há algo para desfazer.
 *
 * **Forma dos controles** — Catálogo de Divergências, Filtro · Opção A (barra
 * com fundo suave: `flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg items-end`):
 * seleções têm a forma do campo do produto — altura 40, raio 4, borda
 * `slate-300/80` — e trazem o nome da dimensão dentro do campo enquanto nada
 * está filtrado. A busca segue a decisão própria (Campo de busca · Opção B,
 * arredondado), que vale também dentro de filtros.
 */

type Registro = (id: string, ativo: boolean) => void;

const FilterBarContext = React.createContext<{ registrar: Registro; loading: boolean } | null>(null);

function useFilterBar(componente: string) {
  const ctx = React.useContext(FilterBarContext);
  if (!ctx) throw new Error(`<FilterBar.${componente}> precisa estar dentro de <FilterBar>`);
  return ctx;
}

/** Registra no container se este campo está filtrando algo. */
function useRegistroDeAtividade(ativo: boolean, componente: string) {
  const { registrar, loading } = useFilterBar(componente);
  const id = React.useId();
  React.useEffect(() => {
    registrar(id, ativo);
    return () => registrar(id, false);
  }, [registrar, id, ativo]);
  return loading;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Devolve todos os campos ao estado neutro. */
  onClear: () => void;
  /** Desabilita os controles sem removê-los da tela. */
  loading?: boolean;
  /** Rótulo acessível da região. */
  "aria-label"?: string;
}

const FilterBarRoot = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ className, children, onClear, loading = false, ...props }, ref) => {
    const [ativos, setAtivos] = React.useState<Record<string, boolean>>({});

    const registrar = React.useCallback<Registro>((id, ativo) => {
      setAtivos((anterior) =>
        anterior[id] === ativo ? anterior : { ...anterior, [id]: ativo },
      );
    }, []);

    const temFiltro = Object.values(ativos).some(Boolean);
    const ctx = React.useMemo(() => ({ registrar, loading }), [registrar, loading]);

    return (
      <FilterBarContext.Provider value={ctx}>
        <div
          ref={ref}
          role="search"
          aria-label={props["aria-label"] ?? "Filtros da listagem"}
          className={cn(
            // `mb-6` faz parte do padrão: a barra sempre precede uma
            // listagem, e sem respiro ela cola no conteúdo. Sobrescrevível
            // por className quando o layout já cuida do espaçamento.
            "mb-6 flex flex-wrap items-end gap-3 rounded-lg bg-muted/50 p-4",
            className,
          )}
          {...props}
        >
          {children}
          {temFiltro && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              disabled={loading}
              className="ml-auto h-10 gap-1.5 rounded-sm"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar
            </Button>
          )}
        </div>
      </FilterBarContext.Provider>
    );
  },
);
FilterBarRoot.displayName = "FilterBar";

export interface FilterBarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Rótulo acessível; o padrão usa o placeholder. */
  "aria-label"?: string;
  className?: string;
}

const FilterBarSearch = React.forwardRef<HTMLInputElement, FilterBarSearchProps>(
  ({ value, onChange, placeholder = "Buscar", className, ...props }, ref) => {
    const loading = useRegistroDeAtividade(value.trim() !== "", "Search");
    return (
      <SearchInput
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={loading}
        placeholder={placeholder}
        aria-label={props["aria-label"] ?? placeholder}
        // Dentro da barra quem desfaz é o "Limpar" dela: dois botões para a
        // mesma ação, um ao lado do outro, é uma escolha a mais sem ganho.
        clearable={false}
        className={cn("min-w-[180px] flex-1", className)}
      />
    );
  },
);
FilterBarSearch.displayName = "FilterBar.Search";

export interface FilterBarOption {
  value: string;
  label: string;
}

export interface FilterBarSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** A primeira opção é a neutra — é ela que define "sem filtro". */
  options: FilterBarOption[];
  className?: string;
}

function FilterBarSelect({ label, value, onChange, options, className }: FilterBarSelectProps) {
  const neutro = options[0]?.value;
  const loading = useRegistroDeAtividade(value !== neutro, "Select");
  const selecionada = options.find((o) => o.value === value);

  return (
    <div className={cn("min-w-[160px]", className)}>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger aria-label={label} className="h-10">
          {/* Sem filtro, o campo mostra o nome da dimensão ("Status"), como
              na Opção A; com filtro, o valor escolhido. */}
          <SelectValue>{value === neutro ? label : selecionada?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
FilterBarSelect.displayName = "Filter.Select";

export interface FilterBarChipsProps extends Omit<FilterBarSelectProps, "className"> {
  className?: string;
}

/**
 * @deprecated Chips são a Opção B do filtro, que a PO não elegeu. Mantido só
 * para não quebrar quem já o usa: renderiza exatamente o `FilterBar.Select`.
 * Use `FilterBar.Select`.
 */
function FilterBarChips(props: FilterBarChipsProps) {
  return <FilterBarSelect {...props} />;
}
FilterBarChips.displayName = "FilterBar.Chips";


export interface FilterBarFieldProps {
  label: string;
  /** Se este campo está filtrando algo — a barra usa para decidir o "Limpar". */
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Slot genérico, para um controle que não é busca nem seleção — data, faixa
 * numérica, seletor de pessoas. O campo informa se está ativo, porque só ele
 * sabe o que é "vazio" no seu caso.
 */
function FilterBarField({ label, active, children, className }: FilterBarFieldProps) {
  const loading = useRegistroDeAtividade(active, "Field");
  const id = React.useId();

  return (
    <div className={cn("min-w-[160px]", className)}>
      <Label htmlFor={id} className="mb-1.5 block text-xs text-muted-foreground">
        {label}
      </Label>
      {/* O controle vem da tela, mas a altura é da barra: sem isto um campo de
          data ou um seletor próprio entraria desalinhado da linha. */}
      <div
        id={id}
        aria-disabled={loading || undefined}
        className="[&_button]:h-10 [&_button]:rounded-sm [&_input]:h-10 [&_input]:rounded-sm"
      >
        {children}
      </div>
    </div>
  );
}
FilterBarField.displayName = "FilterBar.Field";

export const FilterBar = Object.assign(FilterBarRoot, {
  Search: FilterBarSearch,
  Select: FilterBarSelect,
  Chips: FilterBarChips,
  Field: FilterBarField,
});
