import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => <nav aria-label="Breadcrumb" className={cn("hw-breadcrumb", className)} ref={ref} {...props} />,
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => <ol className={cn("hw-breadcrumb__list", className)} ref={ref} {...props} />,
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li className={cn("hw-breadcrumb__item", className)} ref={ref} {...props} />,
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => <a className={cn("hw-breadcrumb__link", className)} ref={ref} {...props} />,
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span aria-current="page" className={cn("hw-breadcrumb__page", className)} ref={ref} {...props} />,
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ children, className, ...props }, ref) => <li aria-hidden="true" className={cn("hw-breadcrumb__separator", className)} ref={ref} {...props}>{children ?? <ChevronRight />}</li>,
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span aria-hidden="true" className={cn("hw-breadcrumb__ellipsis", className)} ref={ref} {...props}><MoreHorizontal /></span>,
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
