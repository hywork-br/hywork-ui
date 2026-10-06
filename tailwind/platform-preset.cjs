// Preset do hywork-plataform (admin).
// Usar junto de tokens/core.css + tokens/platform.css.
//
// No tailwind.config.ts do consumidor:
//   presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
//   content: [..., "./node_modules/@hywork/ui/dist/**/*.js"]
//
// O design system é a única autoridade de cor (Rick, 06/10/2026):
// não redefinir colors/spacing/borderRadius em theme.extend nem declarar
// --primary, --background… no CSS global. A trava é
// @hywork/ui/consumer-check, chamada num teste do consumidor.
const core = require("./core-preset.cjs");

module.exports = {
  presets: [core],
  theme: {
    extend: {
      colors: {
        // superfícies próprias do painel administrativo
        admin: {
          bg: "rgb(var(--admin-bg) / <alpha-value>)",
          surface: "rgb(var(--admin-surface) / <alpha-value>)",
          sidebar: "rgb(var(--admin-sidebar) / <alpha-value>)",
        },
      },
    },
  },
};
