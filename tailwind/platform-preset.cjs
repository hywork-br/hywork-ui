// Preset do hywork-plataform (admin).
// Usar junto de tokens/core.css + tokens/platform.css.
//
// No tailwind.config.ts do consumidor:
//   presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
//   content: [..., "./node_modules/@hywork/ui/dist/**/*.js"]
//
// Não redefinir colors/spacing/borderRadius em theme.extend:
// duplicata vence o preset e o torna inerte.
const core = require("./core-preset.cjs");

module.exports = {
  presets: [core],
  theme: {
    extend: {
      colors: {
        // superfícies próprias do painel administrativo
        admin: {
          bg: "rgb(var(--hw-color-admin-bg) / <alpha-value>)",
          surface: "rgb(var(--hw-color-admin-surface) / <alpha-value>)",
          sidebar: "rgb(var(--hw-color-admin-sidebar) / <alpha-value>)",
        },
      },
    },
  },
};
