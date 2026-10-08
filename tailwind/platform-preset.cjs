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
  // Corpo do admin (Rick, 08/10/2026): o body lê --hw-text-body (14px em
  // platform.css), e todo texto sem classe herda dele. Os controles já eram
  // 14px; o que mudava era o texto solto, em 16px.
  plugins: [
    function bodyText({ addBase }) {
      addBase({
        body: {
          fontSize: "var(--hw-text-body)",
          lineHeight: "var(--hw-leading-body)",
        },
      });
    },
  ],
  theme: {
    extend: {
      colors: {
        // superfícies próprias do painel administrativo
        admin: {
          bg: "rgb(var(--admin-bg) / <alpha-value>)",
          surface: "rgb(var(--admin-surface) / <alpha-value>)",
          sidebar: "rgb(var(--admin-sidebar) / <alpha-value>)",
        },
        // Fundo da FilterBar. O token já traz o alfa (#edf1f5 a 40%), por
        // isso sem <alpha-value>: `bg-hw-filter-surface/NN` não existe.
        "hw-filter-surface": "rgb(var(--hw-filter-surface))",
      },
    },
  },
};
