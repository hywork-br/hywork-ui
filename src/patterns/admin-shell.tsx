import * as React from "react";

import { cn } from "../lib/cn";

export interface AdminNavigationItem {
  href: string;
  icon?: React.ReactNode;
  id: string;
  label: string;
}

export interface AdminShellProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: React.ReactNode;
  currentItem?: string;
  navigation: AdminNavigationItem[];
  utility?: React.ReactNode;
}

export const AdminShell = React.forwardRef<HTMLDivElement, AdminShellProps>(
  ({ brand, children, className, currentItem, navigation, utility, ...props }, ref) => (
    <div className={cn("hw-admin-shell", className)} data-surface="admin" ref={ref} {...props}>
      <aside className="hw-admin-shell__sidebar">
        <div className="hw-admin-shell__brand">{brand}</div>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <a
              aria-current={currentItem === item.id ? "page" : undefined}
              href={item.href}
              key={item.id}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        {utility ? <div className="hw-admin-shell__utility">{utility}</div> : null}
      </aside>
      <div className="hw-admin-shell__content">{children}</div>
    </div>
  ),
);
AdminShell.displayName = "AdminShell";
