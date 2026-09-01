import { Inbox, SearchX, TriangleAlert } from "lucide-react";
import * as React from "react";

import { Button } from "../components/button";
import { cn } from "../lib/cn";

export interface ListPageState {
  action?: React.ReactNode;
  description?: string;
  title: string;
}

export interface ListPageError extends ListPageState {
  onRetry?: () => void;
}

export interface ListPageProps<T> {
  action?: React.ReactNode;
  activeFilterCount?: number;
  className?: string;
  description?: string;
  empty?: ListPageState;
  error?: ListPageError;
  getItemKey?: (item: T, index: number) => React.Key;
  items: T[];
  loading?: boolean;
  loadingLabel?: string;
  noResults?: ListPageState;
  renderItem: (item: T, index: number) => React.ReactNode;
  title: string;
  toolbar?: React.ReactNode;
  view?: "list" | "grid";
}

function StatePanel({
  action,
  description,
  icon,
  title,
}: ListPageState & { icon: React.ReactNode }) {
  return (
    <section className="hw-list-page__state" aria-live="polite">
      <span className="hw-list-page__state-icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </section>
  );
}

export function ListPage<T>({
  action,
  activeFilterCount = 0,
  className,
  description,
  empty = { title: "Nenhum item criado" },
  error,
  getItemKey,
  items,
  loading = false,
  loadingLabel = "Carregando itens",
  noResults = { title: "Nenhum resultado encontrado" },
  renderItem,
  title,
  toolbar,
  view = "list",
}: ListPageProps<T>) {
  let body: React.ReactNode;

  if (loading) {
    body = (
      <div aria-label={loadingLabel} className="hw-list-page__loading" role="status">
        <span />
        <span />
        <span />
      </div>
    );
  } else if (error) {
    body = (
      <StatePanel
        {...error}
        action={
          error.action ??
          (error.onRetry ? (
            <Button onClick={error.onRetry} variant="outline">
              Tentar novamente
            </Button>
          ) : undefined)
        }
        icon={<TriangleAlert aria-hidden="true" />}
      />
    );
  } else if (items.length === 0 && activeFilterCount > 0) {
    body = <StatePanel {...noResults} icon={<SearchX aria-hidden="true" />} />;
  } else if (items.length === 0) {
    body = <StatePanel {...empty} icon={<Inbox aria-hidden="true" />} />;
  } else {
    body = (
      <div className="hw-list-page__items" data-view={view}>
        {items.map((item, index) => (
          <React.Fragment key={getItemKey?.(item, index) ?? index}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <main className={cn("hw-list-page", className)}>
      <header className="hw-list-page__header">
        <div>
          <p className="hw-list-page__eyebrow">Central de operação</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className="hw-list-page__action">{action}</div> : null}
      </header>
      {toolbar ? <div className="hw-list-page__toolbar">{toolbar}</div> : null}
      <p aria-live="polite" className="hw-list-page__count">
        {items.length} {items.length === 1 ? "item" : "itens"}
      </p>
      {body}
    </main>
  );
}
