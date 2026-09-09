import * as React from "react";

import type { AdminNavigationItem } from "./admin-shell";

interface ShellNavigationProps {
  currentItem?: string;
  items: AdminNavigationItem[];
  onNavigate?: (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: AdminNavigationItem
  ) => void;
}

interface NavigationGroup {
  items: AdminNavigationItem[];
  label?: string;
}

function groupItems(items: AdminNavigationItem[]) {
  return items.reduce<NavigationGroup[]>((groups, item) => {
    const group = groups.find((candidate) => candidate.label === item.group);
    if (group) group.items.push(item);
    else groups.push({ items: [item], label: item.group });
    return groups;
  }, []);
}

export function ShellNavigation({
  currentItem,
  items,
  onNavigate,
}: ShellNavigationProps) {
  const labelId = React.useId().replaceAll(":", "");

  return (
    <nav aria-label="Navegação principal" className="hw-shell-navigation">
      {groupItems(items).map((group, groupIndex) => {
        const groupLabelId = `${labelId}-group-${groupIndex}`;
        return (
          <div
            aria-labelledby={group.label ? groupLabelId : undefined}
            className="hw-shell-navigation__group"
            key={`${group.label ?? "ungrouped"}-${groupIndex}`}
            role={group.label ? "group" : undefined}
          >
            {group.label ? (
              <p className="hw-shell-navigation__group-label" id={groupLabelId}>
                {group.label}
              </p>
            ) : null}
            <div className="hw-shell-navigation__items">
              {group.items.map((item) => (
                <a
                  aria-current={currentItem === item.id ? "page" : undefined}
                  href={item.href}
                  key={item.id}
                  onClick={(event) => onNavigate?.(event, item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
