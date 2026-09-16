import { Menu, X } from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../components/dialog";
import { cn } from "../lib/cn";
import { ShellNavigation } from "./shell-navigation";

const MOBILE_NAVIGATION_QUERY = "(max-width: 48rem)";

export interface AdminNavigationItem {
  href: string;
  icon?: React.ReactNode;
  id: string;
  label: string;
  group?: string;
}

/**
 * Resumo do workspace DESENHADO PELO SHELL. Existe porque a alternativa era o
 * CSS alcançar `strong` e `span` soltos dentro do slot — e aí qualquer `span`
 * do consumidor (a sigla do tenant num chip, por exemplo) herdava a tinta de
 * apoio da barra e só saía com estilo inline. Aqui o shell renderiza os
 * elementos e o seletor mira a classe que ele mesmo escreveu.
 *
 * `workspace` continua aceitando qualquer nó: nesse caso o shell só posiciona,
 * sem pintar nada dentro.
 */
export interface AdminWorkspaceSummary {
  media?: React.ReactNode;
  meta?: React.ReactNode;
  name: React.ReactNode;
}

export type AdminShellWorkspace = React.ReactNode | AdminWorkspaceSummary;

export interface AdminShellProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: React.ReactNode;
  currentItem?: string;
  contentId?: string;
  navigation: AdminNavigationItem[];
  navigationTone?: "neutral" | "inverse";
  surface?: "admin" | "portal";
  utility?: React.ReactNode;
  workspace?: AdminShellWorkspace;
}

function isWorkspaceSummary(value: AdminShellWorkspace): value is AdminWorkspaceSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value) &&
    "name" in value
  );
}

function WorkspaceSlot({ workspace }: { workspace: AdminShellWorkspace }) {
  const summary = isWorkspaceSummary(workspace) ? workspace : null;
  return (
    <div className="hw-admin-shell__workspace" data-summary={summary ? "" : undefined}>
      {summary ? (
        <>
          {summary.media ? (
            <span className="hw-admin-shell__workspace-media">{summary.media}</span>
          ) : null}
          <span className="hw-admin-shell__workspace-text">
            <strong className="hw-admin-shell__workspace-name">{summary.name}</strong>
            {summary.meta ? (
              <span className="hw-admin-shell__workspace-meta">{summary.meta}</span>
            ) : null}
          </span>
        </>
      ) : (
        (workspace as React.ReactNode)
      )}
    </div>
  );
}

export const AdminShell = React.forwardRef<HTMLDivElement, AdminShellProps>(
  (
    {
      brand,
      children,
      className,
      contentId,
      currentItem,
      navigation,
      navigationTone = "neutral",
      surface = "admin",
      utility,
      workspace,
      ...props
    },
    ref
  ) => {
    const generatedContentId = React.useId().replaceAll(":", "");
    const resolvedContentId =
      contentId ?? `hw-admin-content-${generatedContentId}`;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const mobileOpenRef = React.useRef(mobileOpen);
    const desktopSidebarRef = React.useRef<HTMLElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const focusDesktopAfterResizeRef = React.useRef(false);

    const updateOpen = React.useCallback((open: boolean) => {
      mobileOpenRef.current = open;
      setMobileOpen(open);
    }, []);

    React.useEffect(() => {
      if (typeof window.matchMedia !== "function") return;
      const media = window.matchMedia(MOBILE_NAVIGATION_QUERY);
      const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
        setIsMobile(event.matches);
        if (!event.matches && mobileOpenRef.current) {
          focusDesktopAfterResizeRef.current = true;
          updateOpen(false);
        }
      };
      handleChange(media);
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }, [updateOpen]);

    React.useEffect(() => {
      if (isMobile || mobileOpen || !focusDesktopAfterResizeRef.current) return;
      focusDesktopAfterResizeRef.current = false;
      const current = desktopSidebarRef.current?.querySelector<HTMLElement>(
        '[aria-current="page"]'
      ) ?? desktopSidebarRef.current?.querySelector<HTMLElement>(".hw-shell-navigation a[href]") ?? contentRef.current;
      current?.focus({ preventScroll: true });
      current?.scrollIntoView({ block: "nearest" });
    }, [isMobile, mobileOpen]);

    const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
      const link = event.currentTarget;
      const target = link.getAttribute("target");
      const opensElsewhere = Boolean(target && target !== "_self");
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        opensElsewhere ||
        link.hasAttribute("download")
      ) {
        return;
      }
      updateOpen(false);
    };

    return (
      <Dialog open={mobileOpen} onOpenChange={updateOpen}>
        <div
          {...props}
          className={cn("hw-admin-shell", className)}
          data-navigation-tone={navigationTone}
          data-surface={surface}
          ref={ref}
        >
          <a
            className="hw-admin-shell__skip-link"
            href={`#${resolvedContentId}`}
          >
            Pular para o conteúdo
          </a>
          <header className="hw-admin-shell__mobile-header">
            {isMobile ? (
              <div className="hw-admin-shell__brand">{brand}</div>
            ) : null}
            <DialogTrigger asChild>
              <button
                aria-label="Abrir navegação"
                className="hw-admin-shell__menu-trigger"
                type="button"
              >
                <Menu aria-hidden="true" />
              </button>
            </DialogTrigger>
          </header>

          {!isMobile ? (
            <aside className="hw-admin-shell__sidebar" ref={desktopSidebarRef}>
              <div className="hw-admin-shell__brand">{brand}</div>
              {workspace ? <WorkspaceSlot workspace={workspace} /> : null}
              <ShellNavigation currentItem={currentItem} items={navigation} />
              {utility ? (
                <div className="hw-admin-shell__utility">{utility}</div>
              ) : null}
            </aside>
          ) : null}

          <div
            className="hw-admin-shell__content"
            ref={contentRef}
            id={resolvedContentId}
            tabIndex={-1}
          >
            {children}
          </div>
        </div>

        {isMobile ? (
          <DialogContent
            aria-describedby={undefined}
            className="hw-shell-navigation-panel"
            data-navigation-tone={navigationTone}
            data-surface={surface}
            onCloseAutoFocus={(event) => {
              if (focusDesktopAfterResizeRef.current) event.preventDefault();
            }}
            onOpenAutoFocus={(event) => {
              const current = panelRef.current?.querySelector<HTMLElement>(
                '[aria-current="page"]'
              );
              if (current) {
                event.preventDefault();
                current.focus({ preventScroll: true });
                current.scrollIntoView({ block: "center" });
              }
            }}
            ref={panelRef}
          >
            <header className="hw-shell-navigation-panel__header">
              <DialogTitle>Navegação principal</DialogTitle>
              <DialogClose asChild>
                <button
                  aria-label="Fechar navegação"
                  className="hw-shell-navigation-panel__close"
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </DialogClose>
            </header>
            {workspace ? <WorkspaceSlot workspace={workspace} /> : null}
            <div className="hw-shell-navigation-panel__body">
              <ShellNavigation
                currentItem={currentItem}
                items={navigation}
                onNavigate={handleNavigate}
              />
            </div>
            {utility ? (
              <div className="hw-admin-shell__utility">{utility}</div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    );
  }
);
AdminShell.displayName = "AdminShell";
