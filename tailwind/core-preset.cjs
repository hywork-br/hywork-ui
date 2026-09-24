// Preset base — valores comuns aos dois consumidores do design system.
// Tipografia, escala, espaçamento, raio, paletas e papéis de status.
// Cor de marca vem dos tokens CSS de cada produto, com duplo fallback:
//   hsl(var(--primary, var(--hw-color-primary-default)))
// — a variável da aplicação sempre vence o default da biblioteca.
const config = {
  "darkMode": [
    "class"
  ],
  "content": [
    "./src/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx}",
    "./tests/fixtures/**/*.{ts,tsx}"
  ],
  "theme": {
    "extend": {
      "fontFamily": {
        "sans": [
          "var(--font-montserrat, var(--hw-font-body))"
        ],
        "montserrat": [
          "var(--font-montserrat, var(--hw-font-body))"
        ]
      },
      "fontSize": {
        "xs": [
          "var(--hw-text-xs)",
          {
            "lineHeight": "var(--hw-leading-xs)"
          }
        ],
        "sm": [
          "var(--hw-text-sm)",
          {
            "lineHeight": "var(--hw-leading-sm)"
          }
        ],
        "base": [
          "var(--hw-text-base)",
          {
            "lineHeight": "var(--hw-leading-base)"
          }
        ],
        "lg": [
          "var(--hw-text-lg)",
          {
            "lineHeight": "var(--hw-leading-lg)"
          }
        ],
        "xl": [
          "var(--hw-text-xl)",
          {
            "lineHeight": "var(--hw-leading-xl)"
          }
        ],
        "2xl": [
          "var(--hw-text-2xl)",
          {
            "lineHeight": "var(--hw-leading-2xl)"
          }
        ],
        "3xl": [
          "var(--hw-text-3xl)",
          {
            "lineHeight": "var(--hw-leading-3xl)"
          }
        ],
        "4xl": [
          "var(--hw-text-4xl)",
          {
            "lineHeight": "var(--hw-leading-4xl)"
          }
        ]
      },
      "fontWeight": {
        "light": "var(--hw-weight-light)",
        "normal": "var(--hw-weight-normal)",
        "medium": "var(--hw-weight-medium)",
        "semibold": "var(--hw-weight-semibold)",
        "bold": "var(--hw-weight-bold)",
        "extrabold": "var(--hw-weight-extrabold)"
      },
      "colors": {
        "background": "hsl(var(--background, var(--hw-color-background)) / <alpha-value>)",
        "foreground": "hsl(var(--foreground, var(--hw-color-foreground)) / <alpha-value>)",
        "card": {
          "DEFAULT": "hsl(var(--card, var(--hw-color-card-default)) / <alpha-value>)",
          "foreground": "hsl(var(--card-foreground, var(--hw-color-card-foreground)) / <alpha-value>)"
        },
        "popover": {
          "DEFAULT": "hsl(var(--popover, var(--hw-color-popover-default)) / <alpha-value>)",
          "foreground": "hsl(var(--popover-foreground, var(--hw-color-popover-foreground)) / <alpha-value>)"
        },
        "primary": {
          "50": "hsl(var(--hw-color-primary-50) / <alpha-value>)",
          "100": "hsl(var(--hw-color-primary-100) / <alpha-value>)",
          "200": "hsl(var(--hw-color-primary-200) / <alpha-value>)",
          "300": "hsl(var(--hw-color-primary-300) / <alpha-value>)",
          "400": "hsl(var(--hw-color-primary-400) / <alpha-value>)",
          "500": "hsl(var(--primary, var(--hw-color-primary-500)) / <alpha-value>)",
          "600": "hsl(var(--hw-color-primary-600) / <alpha-value>)",
          "700": "hsl(var(--hw-color-primary-700) / <alpha-value>)",
          "800": "hsl(var(--hw-color-primary-800) / <alpha-value>)",
          "900": "hsl(var(--hw-color-primary-900) / <alpha-value>)",
          "DEFAULT": "hsl(var(--primary, var(--hw-color-primary-default)) / <alpha-value>)",
          "foreground": "hsl(var(--primary-foreground, var(--hw-color-primary-foreground)) / <alpha-value>)"
        },
        "secondary": {
          "DEFAULT": "hsl(var(--secondary, var(--hw-color-secondary-default)) / <alpha-value>)",
          "foreground": "hsl(var(--secondary-foreground, var(--hw-color-secondary-foreground)) / <alpha-value>)"
        },
        "success": {
          "50": "hsl(var(--hw-color-success-50) / <alpha-value>)",
          "100": "hsl(var(--hw-color-success-100) / <alpha-value>)",
          "500": "hsl(var(--hw-color-success-500) / <alpha-value>)",
          "600": "hsl(var(--hw-color-success-600) / <alpha-value>)",
          "700": "hsl(var(--hw-color-success-700) / <alpha-value>)",
          "DEFAULT": "hsl(var(--hw-color-success-default) / <alpha-value>)",
          "foreground": "hsl(var(--hw-color-success-foreground) / <alpha-value>)"
        },
        "warning": {
          "50": "hsl(var(--hw-color-warning-50) / <alpha-value>)",
          "100": "hsl(var(--hw-color-warning-100) / <alpha-value>)",
          "500": "hsl(var(--hw-color-warning-500) / <alpha-value>)",
          "600": "hsl(var(--hw-color-warning-600) / <alpha-value>)",
          "700": "hsl(var(--hw-color-warning-700) / <alpha-value>)",
          "DEFAULT": "hsl(var(--hw-color-warning-default) / <alpha-value>)",
          "foreground": "hsl(var(--hw-color-warning-foreground) / <alpha-value>)"
        },
        "error": {
          "50": "hsl(var(--hw-color-error-50) / <alpha-value>)",
          "100": "hsl(var(--hw-color-error-100) / <alpha-value>)",
          "500": "hsl(var(--hw-color-error-500) / <alpha-value>)",
          "600": "hsl(var(--hw-color-error-600) / <alpha-value>)",
          "700": "hsl(var(--hw-color-error-700) / <alpha-value>)",
          "DEFAULT": "hsl(var(--hw-color-error-default) / <alpha-value>)",
          "foreground": "hsl(var(--hw-color-error-foreground) / <alpha-value>)"
        },
        "info": {
          "50": "hsl(var(--hw-color-info-50) / <alpha-value>)",
          "100": "hsl(var(--hw-color-info-100) / <alpha-value>)",
          "500": "hsl(var(--hw-color-info-500) / <alpha-value>)",
          "600": "hsl(var(--hw-color-info-600) / <alpha-value>)",
          "700": "hsl(var(--hw-color-info-700) / <alpha-value>)",
          "DEFAULT": "hsl(var(--hw-color-info-default) / <alpha-value>)",
          "foreground": "hsl(var(--hw-color-info-foreground) / <alpha-value>)"
        },
        "muted": {
          "DEFAULT": "hsl(var(--muted, var(--hw-color-muted-default)) / <alpha-value>)",
          "foreground": "hsl(var(--muted-foreground, var(--hw-color-muted-foreground)) / <alpha-value>)"
        },
        "accent": {
          "DEFAULT": "hsl(var(--accent, var(--hw-color-accent-default)) / <alpha-value>)",
          "foreground": "hsl(var(--accent-foreground, var(--hw-color-accent-foreground)) / <alpha-value>)"
        },
        "destructive": {
          "DEFAULT": "hsl(var(--destructive, var(--hw-color-destructive-default)) / <alpha-value>)",
          "foreground": "hsl(var(--destructive-foreground, var(--hw-color-destructive-foreground)) / <alpha-value>)"
        },
        "border": "hsl(var(--border, var(--hw-color-border)) / <alpha-value>)",
        "input": "hsl(var(--input, var(--hw-color-input)) / <alpha-value>)",
        "ring": "hsl(var(--ring, var(--hw-color-ring)) / <alpha-value>)",
        "chart": {
          "1": "hsl(var(--chart-1, var(--hw-color-chart-1)) / <alpha-value>)",
          "2": "hsl(var(--chart-2, var(--hw-color-chart-2)) / <alpha-value>)",
          "3": "hsl(var(--chart-3, var(--hw-color-chart-3)) / <alpha-value>)",
          "4": "hsl(var(--chart-4, var(--hw-color-chart-4)) / <alpha-value>)",
          "5": "hsl(var(--chart-5, var(--hw-color-chart-5)) / <alpha-value>)"
        },
        "hw-on-status": "rgb(var(--hw-on-status) / <alpha-value>)",
        "hw-status-success": "rgb(var(--hw-status-success) / <alpha-value>)",
        "hw-status-warning": "rgb(var(--hw-status-warning) / <alpha-value>)",
        "hw-status-danger": "rgb(var(--hw-status-danger) / <alpha-value>)",
        "hw-status-info": "rgb(var(--hw-status-info) / <alpha-value>)",
        "red": {
          "50": "rgb(var(--hw-palette-red-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-red-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-red-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-red-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-red-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-red-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-red-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-red-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-red-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-red-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-red-950) / <alpha-value>)"
        },
        "emerald": {
          "50": "rgb(var(--hw-palette-emerald-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-emerald-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-emerald-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-emerald-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-emerald-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-emerald-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-emerald-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-emerald-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-emerald-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-emerald-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-emerald-950) / <alpha-value>)"
        },
        "yellow": {
          "50": "rgb(var(--hw-palette-yellow-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-yellow-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-yellow-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-yellow-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-yellow-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-yellow-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-yellow-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-yellow-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-yellow-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-yellow-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-yellow-950) / <alpha-value>)"
        },
        "blue": {
          "50": "rgb(var(--hw-palette-blue-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-blue-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-blue-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-blue-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-blue-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-blue-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-blue-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-blue-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-blue-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-blue-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-blue-950) / <alpha-value>)"
        },
        "slate": {
          "50": "rgb(var(--hw-palette-slate-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-slate-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-slate-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-slate-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-slate-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-slate-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-slate-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-slate-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-slate-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-slate-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-slate-950) / <alpha-value>)"
        },
        "gray": {
          "50": "rgb(var(--hw-palette-gray-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-gray-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-gray-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-gray-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-gray-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-gray-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-gray-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-gray-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-gray-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-gray-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-gray-950) / <alpha-value>)"
        },
        "zinc": {
          "50": "rgb(var(--hw-palette-zinc-50) / <alpha-value>)",
          "100": "rgb(var(--hw-palette-zinc-100) / <alpha-value>)",
          "200": "rgb(var(--hw-palette-zinc-200) / <alpha-value>)",
          "300": "rgb(var(--hw-palette-zinc-300) / <alpha-value>)",
          "400": "rgb(var(--hw-palette-zinc-400) / <alpha-value>)",
          "500": "rgb(var(--hw-palette-zinc-500) / <alpha-value>)",
          "600": "rgb(var(--hw-palette-zinc-600) / <alpha-value>)",
          "700": "rgb(var(--hw-palette-zinc-700) / <alpha-value>)",
          "800": "rgb(var(--hw-palette-zinc-800) / <alpha-value>)",
          "900": "rgb(var(--hw-palette-zinc-900) / <alpha-value>)",
          "950": "rgb(var(--hw-palette-zinc-950) / <alpha-value>)"
        },
        "white": "#fff",
        "black": "#000",
        "hw-table-border": "rgb(var(--hw-table-border) / <alpha-value>)",
        "hw-table-surface": "rgb(var(--hw-table-surface) / <alpha-value>)",
        "hw-table-selected": "rgb(var(--hw-table-selected) / <alpha-value>)",
        "hw-table-heading": "rgb(var(--hw-table-heading) / <alpha-value>)",
        "hw-table-foreground": "rgb(var(--hw-table-foreground) / <alpha-value>)",
        "hw-table-caption": "rgb(var(--hw-table-caption) / <alpha-value>)"
      },
      "spacing": {
        "0": "var(--hw-space-0)",
        "1": "var(--hw-space-1)",
        "2": "var(--hw-space-2)",
        "3": "var(--hw-space-3)",
        "4": "var(--hw-space-4)",
        "5": "var(--hw-space-5)",
        "6": "var(--hw-space-6)",
        "7": "var(--hw-space-7)",
        "8": "var(--hw-space-8)",
        "9": "var(--hw-space-9)",
        "10": "var(--hw-space-10)",
        "11": "var(--hw-space-11)",
        "12": "var(--hw-space-12)",
        "14": "var(--hw-space-14)",
        "16": "var(--hw-space-16)",
        "20": "var(--hw-space-20)",
        "24": "var(--hw-space-24)",
        "28": "var(--hw-space-28)",
        "32": "var(--hw-space-32)",
        "36": "var(--hw-space-36)",
        "40": "var(--hw-space-40)",
        "44": "var(--hw-space-44)",
        "48": "var(--hw-space-48)",
        "52": "var(--hw-space-52)",
        "56": "var(--hw-space-56)",
        "60": "var(--hw-space-60)",
        "64": "var(--hw-space-64)",
        "72": "var(--hw-space-72)",
        "80": "var(--hw-space-80)",
        "96": "var(--hw-space-96)",
        "px": "var(--hw-space-px)",
        "0.5": "var(--hw-space-0-5)",
        "1.5": "var(--hw-space-1-5)",
        "2.5": "var(--hw-space-2-5)",
        "3.5": "var(--hw-space-3-5)",
        "sidebar": "var(--hw-space-sidebar)",
        "sidebar-collapsed": "var(--hw-space-sidebar-collapsed)",
        "header": "var(--hw-space-header)",
        "content-gap": "var(--hw-space-content-gap)"
      },
      "borderRadius": {
        "none": "var(--hw-radius-none)",
        "sm": "var(--hw-radius-sm)",
        "DEFAULT": "var(--hw-radius-default)",
        "md": "var(--hw-radius-md)",
        "lg": "var(--hw-radius-lg)",
        "xl": "var(--hw-radius-xl)",
        "2xl": "var(--hw-radius-2xl)",
        "full": "var(--hw-radius-full)",
        "base": "var(--radius)",
        "radius-md": "calc(var(--radius) - 2px)",
        "radius-sm": "calc(var(--radius) - 4px)"
      },
      "keyframes": {
        "fadeIn": {
          "from": {
            "opacity": "0",
            "transform": "translateY(12px)"
          },
          "to": {
            "opacity": "1",
            "transform": "translateY(0)"
          }
        },
        "accordion-down": {
          "from": {
            "height": "0"
          },
          "to": {
            "height": "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          "from": {
            "height": "var(--radix-accordion-content-height)"
          },
          "to": {
            "height": "0"
          }
        }
      },
      "animation": {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      },
      "ringColor": {
        "DEFAULT": "rgb(var(--hw-palette-blue-500) / 0.5)"
      }
    }
  },
  "plugins": [],
  "safelist": [
    "bg-background",
    "text-foreground",
    "bg-primary",
    "text-primary",
    "bg-secondary",
    "text-secondary",
    "bg-muted",
    "text-muted",
    "bg-accent",
    "text-accent",
    "bg-destructive",
    "text-destructive"
  ]
};
config.plugins = [require("tailwindcss-animate")];
delete config.content;
module.exports = config;
