// Preset do hw-cloud-builder (intranet do colaborador).
// Usar junto de tokens/core.css + tokens/builder.css.
//
// O design system é a única autoridade de cor (Rick, 06/10/2026): a
// intranet não redefine cores no theme.extend nem declara --primary no CSS.
// A cor do workspace entra por --hw-brand-primary (brandThemeVars).
//
// No tailwind.config.ts do consumidor:
//   presets: [require("@hywork/ui/tailwind/builder-preset.cjs")],
//   content: [..., "./node_modules/@hywork/ui/dist/**/*.js"]
//
// ATENÇÃO — mudança de valor em relação ao config atual do Builder:
// rounded-lg passa de 0.5rem para 0.75rem e rounded-md de 0.375rem
// para 0.5rem, alinhando-se ao Platform. São ~1.097 usos afetados nos
// dois repositórios; validar por captura antes de subir.
const core = require("./core-preset.cjs");

module.exports = {
  presets: [core],
};
