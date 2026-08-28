/**
 * GERADO por scripts/gerar-preset-v3.mjs — não edite à mão.
 * A fonte é tokens/semantico.css; rode o script depois de mexer nela.
 *
 * Uso no consumidor (Tailwind v3):
 *
 *   // tailwind.config.ts
 *   presets: [require("@hywork/ui/tailwind/v3-preset.cjs")],
 *
 * E importe os tokens no CSS global:
 *
 *   @import "@hywork/ui/tokens/tema.css";
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        "primary": "var(--hw-primary)",
        "primary-hover": "var(--hw-primary-hover)",
        "primary-fg": "var(--hw-primary-fg)",
        "primary-soft": "var(--hw-primary-soft)",
        "secondary": "var(--hw-secondary)",
        "secondary-hover": "var(--hw-secondary-hover)",
        "secondary-fg": "var(--hw-secondary-fg)",
        "secondary-soft": "var(--hw-secondary-soft)",
        "surface": "var(--hw-surface)",
        "surface-fg": "var(--hw-surface-fg)",
        "surface-subtle": "var(--hw-surface-subtle)",
        "surface-subtle-fg": "var(--hw-surface-subtle-fg)",
        "surface-inverse": "var(--hw-surface-inverse)",
        "surface-inverse-fg": "var(--hw-surface-inverse-fg)",
        "surface-accent": "var(--hw-surface-accent)",
        "surface-accent-fg": "var(--hw-surface-accent-fg)",
        "text": "var(--hw-text)",
        "text-secondary": "var(--hw-text-secondary)",
        "text-muted": "var(--hw-text-muted)",
        "text-inverse": "var(--hw-text-inverse)",
        "text-inverse-secondary": "var(--hw-text-inverse-secondary)",
        "accent": "var(--hw-accent)",
        "accent-fg": "var(--hw-accent-fg)",
        "popover": "var(--hw-popover)",
        "popover-fg": "var(--hw-popover-fg)",
        "card": "var(--hw-card)",
        "card-fg": "var(--hw-card-fg)",
        "border": "var(--hw-border)",
        "border-strong": "var(--hw-border-strong)",
        "focus": "var(--hw-focus)",
        "success": "var(--hw-success)",
        "success-fg": "var(--hw-success-fg)",
        "warning": "var(--hw-warning)",
        "warning-fg": "var(--hw-warning-fg)",
        "danger": "var(--hw-danger)",
        "danger-fg": "var(--hw-danger-fg)",
        "muted": "var(--hw-muted)",
        "muted-fg": "var(--hw-muted-fg)",
        "info": "var(--hw-info)",
        "info-fg": "var(--hw-info-fg)",
        "danger-strong": "var(--hw-danger-strong)",
        "danger-strong-fg": "var(--hw-danger-strong-fg)",
        "scrim": "var(--hw-scrim)",
        "scrim-fg": "var(--hw-scrim-fg)",
        "success-soft": "var(--hw-success-soft)",
        "success-soft-fg": "var(--hw-success-soft-fg)",
        "warning-soft": "var(--hw-warning-soft)",
        "warning-soft-fg": "var(--hw-warning-soft-fg)",
        "danger-soft": "var(--hw-danger-soft)",
        "danger-soft-fg": "var(--hw-danger-soft-fg)",
        "info-soft": "var(--hw-info-soft)",
        "info-soft-fg": "var(--hw-info-soft-fg)",
        "neutral-soft": "var(--hw-neutral-soft)",
        "neutral-soft-fg": "var(--hw-neutral-soft-fg)",
        "muted-strong": "var(--hw-muted-strong)",
        "muted-strong-fg": "var(--hw-muted-strong-fg)",
        "chart-1": "var(--hw-chart-1)",
        "chart-2": "var(--hw-chart-2)",
        "chart-3": "var(--hw-chart-3)",
        "chart-4": "var(--hw-chart-4)",
        "chart-5": "var(--hw-chart-5)",
        "chart-6": "var(--hw-chart-6)",
        "duration-fast": "var(--hw-duration-fast)",
        "duration-base": "var(--hw-duration-base)",
        "duration-slow": "var(--hw-duration-slow)"
      },
      fontFamily: {
        "heading": "var(--hw-font-heading)",
        "body": "var(--hw-font-body)"
      },
      borderRadius: {
        "sm": "var(--hw-radius-sm)",
        "md": "var(--hw-radius-md)",
        "lg": "var(--hw-radius-lg)",
        "full": "var(--hw-radius-full)"
      },
    },
  },
};
