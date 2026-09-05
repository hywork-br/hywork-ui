import * as React from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/cn";

export interface FeedbackProps {
  title: string;
  description?: React.ReactNode;
  severity?: "info" | "success" | "warning" | "error";
  /** One announcement owner per event. Severity does not imply urgency. */
  announcement?: "polite" | "assertive" | "off";
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    pending?: boolean;
  };
  onDismiss?: () => void;
  className?: string;
}
function Feedback({
  title,
  description,
  severity = "info",
  announcement = "polite",
  action,
  onDismiss,
  className,
  kind,
}: FeedbackProps & { kind: string }) {
  const Icon =
    severity === "success"
      ? CircleCheck
      : severity === "info"
      ? Info
      : TriangleAlert;
  return (
    <section
      className={cn("hw-feedback", className)}
      data-kind={kind}
      data-severity={severity}
      role={
        announcement === "off"
          ? undefined
          : announcement === "assertive"
          ? "alert"
          : "status"
      }
      aria-atomic={announcement === "off" ? undefined : true}
    >
      <Icon aria-hidden="true" className="hw-feedback__icon" />
      <div className="hw-feedback__copy">
        <strong>{title}</strong>
        {description && <div>{description}</div>}
      </div>
      {action && (
        <Button
          variant="quiet"
          disabled={action.disabled}
          loading={action.pending}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {onDismiss && (
        <Button
          variant="quiet"
          size="icon"
          aria-label={`Dispensar: ${title}`}
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}
/** Controlled visibility: consumer mounts/unmounts; no timers or network. */
export function InlineNotice(props: FeedbackProps) {
  return <Feedback {...props} kind="inline" />;
}
export function Banner(props: FeedbackProps) {
  return <Feedback {...props} kind="banner" />;
}
export function Toast(props: FeedbackProps) {
  return <Feedback {...props} kind="toast" />;
}
