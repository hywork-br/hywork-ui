import { X } from "lucide-react";
import * as React from "react";

import { Button } from "../components/button";
import { cn } from "../lib/cn";

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove?: () => void;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeFilters?: ActiveFilter[];
  filters?: React.ReactNode;
  onClearAll?: () => void;
  search: React.ReactNode;
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ activeFilters = [], className, filters, onClearAll, search, ...props }, ref) => (
    <section className={cn("hw-filter-bar", className)} ref={ref} {...props}>
      <div className="hw-filter-bar__controls">
        <div className="hw-filter-bar__search">{search}</div>
        {filters ? (
          <div aria-label="Filtros" className="hw-filter-bar__filters">
            {filters}
          </div>
        ) : null}
      </div>
      {activeFilters.length > 0 ? (
        <div aria-label="Filtros ativos" className="hw-filter-bar__active">
          {activeFilters.map((filter) => (
            <span className="hw-filter-chip" key={filter.id}>
              {filter.label}
              {filter.onRemove ? (
                <button aria-label={`Remover ${filter.label}`} onClick={filter.onRemove} type="button">
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </span>
          ))}
          {onClearAll ? (
            <Button onClick={onClearAll} size="sm" variant="quiet">
              Limpar filtros
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  ),
);
FilterBar.displayName = "FilterBar";
