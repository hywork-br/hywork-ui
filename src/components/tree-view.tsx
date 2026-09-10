import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: readonly TreeNode[];
}
export interface TreeViewProps {
  ariaLabel: string;
  nodes: readonly TreeNode[];
  expandedIds: readonly string[];
  onExpandedChange: (ids: string[]) => void;
  selectedId?: string;
  onSelectionChange: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}
type Entry = { node: TreeNode; parent?: string };
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

/** Controlled single-selection hierarchy. Domain loading, editing and persistence stay outside. */
export function TreeView({
  ariaLabel,
  nodes,
  expandedIds,
  onExpandedChange,
  selectedId,
  onSelectionChange,
  readOnly = false,
  className,
}: TreeViewProps) {
  const uid = React.useId();
  const elements = React.useRef(new Map<string, HTMLLIElement>());
  const focusWithin = React.useRef(false);
  const previousEntries = React.useRef(new Map<string, Entry>());
  const typeahead = React.useRef({ text: "", at: 0 });
  const [focusedId, setFocusedId] = React.useState(nodes[0]?.id);
  const { all, visible } = React.useMemo(() => {
    const all = new Map<string, Entry>();
    const visible: Entry[] = [];
    const visit = (items: readonly TreeNode[], parent?: string, shown = true) =>
      items.forEach((node) => {
        if (!node.id || all.has(node.id))
          throw new Error("TreeView nodes require unique nonempty IDs");
        const entry = { node, parent };
        all.set(node.id, entry);
        if (shown) visible.push(entry);
        if (node.children)
          visit(node.children, node.id, shown && expandedIds.includes(node.id));
      });
    visit(nodes);
    return { all, visible };
  }, [nodes, expandedIds]);
  const visibleIds = visible.map((entry) => entry.node.id);
  const resolvedFocus = visibleIds.includes(focusedId ?? "")
    ? focusedId
    : visibleIds[0];
  React.useLayoutEffect(() => {
    if (focusedId && !visibleIds.includes(focusedId)) {
      let candidate: string | undefined = focusedId;
      const visited = new Set<string>();
      while (
        candidate &&
        !visibleIds.includes(candidate) &&
        !visited.has(candidate)
      ) {
        visited.add(candidate);
        candidate = (
          all.get(candidate) ?? previousEntries.current.get(candidate)
        )?.parent;
      }
      candidate ??= visibleIds[0];
      setFocusedId(candidate);
      if (candidate && focusWithin.current)
        elements.current.get(candidate)?.focus();
    }
    previousEntries.current = all;
  }, [all, focusedId, visibleIds.join("\u0000")]);
  const focus = (id?: string) => {
    if (id) {
      setFocusedId(id);
      elements.current.get(id)?.focus();
    }
  };
  const toggle = (id: string) =>
    onExpandedChange(
      expandedIds.includes(id)
        ? expandedIds.filter((value) => value !== id)
        : [...expandedIds, id]
    );
  const select = (node: TreeNode) => {
    if (!node.disabled && !readOnly) onSelectionChange(node.id);
  };
  const keydown = (event: React.KeyboardEvent, node: TreeNode) => {
    event.stopPropagation();
    const index = visibleIds.indexOf(node.id);
    const branch = !!node.children?.length;
    const open = expandedIds.includes(node.id);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focus(visibleIds[Math.min(index + 1, visibleIds.length - 1)]);
        break;
      case "ArrowUp":
        event.preventDefault();
        focus(visibleIds[Math.max(index - 1, 0)]);
        break;
      case "Home":
        event.preventDefault();
        focus(visibleIds[0]);
        break;
      case "End":
        event.preventDefault();
        focus(visibleIds.at(-1));
        break;
      case "ArrowRight":
        event.preventDefault();
        if (branch) {
          if (!open) toggle(node.id);
          else focus(node.children?.[0].id);
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (branch && open) toggle(node.id);
        else focus(all.get(node.id)?.parent);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(node);
        break;
      default:
        if (
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        const now = Date.now();
        const letter = normalize(event.key);
        const text =
          now - typeahead.current.at < 600
            ? typeahead.current.text + letter
            : letter;
        typeahead.current = { text, at: now };
        const search = text.split("").every((character) => character === letter)
          ? letter
          : text;
        const ordered = [
          ...visible.slice(index + 1),
          ...visible.slice(0, index + 1),
        ];
        focus(
          ordered.find((entry) =>
            normalize(entry.node.label).startsWith(search)
          )?.node.id
        );
    }
  };
  const renderNodes = (items: readonly TreeNode[]) =>
    items.map((node) => {
      const branch = !!node.children?.length;
      const open = expandedIds.includes(node.id);
      const labelId = `${uid}-${node.id}-label`;
      const descriptionId = `${uid}-${node.id}-description`;
      return (
        <li
          key={node.id}
          role="treeitem"
          aria-labelledby={labelId}
          aria-describedby={node.description ? descriptionId : undefined}
          aria-expanded={branch ? open : undefined}
          aria-selected={selectedId === node.id}
          aria-disabled={node.disabled || undefined}
          tabIndex={resolvedFocus === node.id ? 0 : -1}
          ref={(element) => {
            if (element) elements.current.set(node.id, element);
            else elements.current.delete(node.id);
          }}
          onFocus={(event) => {
            if (event.target === event.currentTarget) {
              focusWithin.current = true;
              setFocusedId(node.id);
            }
          }}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget) keydown(event, node);
          }}
          onClick={(event) => {
            event.stopPropagation();
            focus(node.id);
            select(node);
          }}
        >
          <div className="hw-tree__row">
            {branch ? (
              <button
                type="button"
                className="hw-tree__disclosure"
                tabIndex={-1}
                aria-label={`${open ? "Recolher" : "Expandir"} ${node.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  focus(node.id);
                  toggle(node.id);
                }}
              >
                {open ? (
                  <ChevronDown aria-hidden />
                ) : (
                  <ChevronRight aria-hidden />
                )}
              </button>
            ) : (
              <span className="hw-tree__spacer" aria-hidden />
            )}
            {node.icon ? (
              <span className="hw-tree__icon" aria-hidden>
                {node.icon}
              </span>
            ) : null}
            <span className="hw-tree__content">
              <span id={labelId}>{node.label}</span>
              {node.description ? (
                <span id={descriptionId} className="hw-tree__description">
                  {node.description}
                </span>
              ) : null}
            </span>
          </div>
          {branch && open ? (
            <ul role="group">{renderNodes(node.children!)}</ul>
          ) : null}
        </li>
      );
    });
  return (
    <ul
      role="tree"
      aria-label={`${ariaLabel}${readOnly ? " (somente leitura)" : ""}`}
      data-readonly={readOnly || undefined}
      className={cn("hw-tree", className)}
      onBlur={(event) => {
        focusWithin.current =
          !!event.relatedTarget &&
          event.currentTarget.contains(event.relatedTarget as Node);
      }}
    >
      {renderNodes(nodes)}
    </ul>
  );
}
