import { defineConfig } from "tsup";

// Duas saídas. `dist/` é limpo pelo script build:lib antes do tsup: as duas
// configurações rodam em paralelo, e um `clean` em cada uma apagaria a outra.
export default defineConfig([
  {
    // Componentes: tudo leva "use client", exigido pelo App Router para
    // componentes com estado vindos de um pacote.
    dts: true,
    entry: ["src/index.ts", "src/platform.ts", "src/builder.ts"],
    external: ["react", "react-dom"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    splitting: true,
    target: "es2022",
    banner: { js: '"use client";' },
  },
  {
    // Funções puras, SEM "use client": a cor de marca precisa rodar num Server
    // Component (`<html style={brandThemeVars(hex)}>`).
    dts: true,
    entry: ["src/theme.ts"],
    format: ["esm"],
    minify: false,
    sourcemap: true,
    splitting: false,
    target: "es2022",
  },
]);
