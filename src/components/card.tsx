import * as React from "react";

import { cn } from "../lib/cn";

function component<T extends HTMLElement>(name: string, defaultTag: keyof React.JSX.IntrinsicElements) {
  const Component = React.forwardRef<T, React.HTMLAttributes<T>>(
    ({ className, ...props }, ref) =>
      React.createElement(defaultTag, { className: cn(name, className), ref, ...props }),
  );
  Component.displayName = name;
  return Component;
}

export const Card = component<HTMLElement>("hw-card", "article");
export const CardHeader = component<HTMLElement>("hw-card__header", "header");

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as = "h3", className, ...props }, ref) =>
    React.createElement(as, { className: cn("hw-card__title", className), ref, ...props }),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = component<HTMLParagraphElement>("hw-card__description", "p");
export const CardContent = component<HTMLDivElement>("hw-card__content", "div");
export const CardFooter = component<HTMLElement>("hw-card__footer", "footer");
