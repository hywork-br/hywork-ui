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

export interface AdminShellProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: React.ReactNode;
  currentItem?: string;
  contentId?: string;
  navigation: AdminNavigationItem[];
  navigationTone?: "neutral" | "inverse";
  utility?: React.ReactNode;
  workspace?: React.ReactNode;
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
          className={cn("hw-admin-shell", className)}
          data-navigation-tone={navigationTone}
          data-surface="admin"
          ref={ref}
          {...props}
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
              {workspace ? (
                <div className="hw-admin-shell__workspace">{workspace}</div>
              ) : null}
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
            {workspace ? (
              <div className="hw-admin-shell__workspace">{workspace}</div>
            ) : null}
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
