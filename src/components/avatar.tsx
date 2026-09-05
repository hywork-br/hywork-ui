import * as React from "react";

import { cn } from "../lib/cn";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join("");
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  alt?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ alt, className, name, size = "md", src, ...props }, ref) => {
    const [failed, setFailed] = React.useState(false);
    return (
      <span
        aria-label={src && !failed ? undefined : name}
        className={cn("hw-avatar", className)}
        data-size={size}
        ref={ref}
        role={src && !failed ? undefined : "img"}
        {...props}
      >
        {src && !failed ? (
          <img src={src} alt={alt ?? name} onError={() => setFailed(true)} />
        ) : (
          <span aria-hidden="true">{initials(name)}</span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";
