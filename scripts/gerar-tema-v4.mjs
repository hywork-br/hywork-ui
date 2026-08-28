#!/usr/bin/env node
/**
 * Gera a ponte de Tailwind v4 a partir da camada semântica.
 *
 * Existe pelo mesmo motivo do gerador do v3, e por uma razão a mais aprendida
 * na prática: até 25/08 este arquivo era escrito à MÃO, e tinha derivado para
 * 31 das 65 entradas que o preset v3 publicava. Faltavam --color-danger-fg,
 * --color-muted-fg, os pares *-soft inteiros e os raios — tokens que existem em
 * semantico.css há versões.
 *
 * E a defasagem era INVISÍVEL, que é o que a torna cara: `@apply text-danger-fg`
 * sem a entrada correspondente no @theme não gera utility, não quebra o build e
 * não acusa no lint. A regra simplesmente some da folha, e quem for depurar vai
 * procurar no componente.
 *
 *   node scripts/gerar-tema-v4.mjs
 *
 * O CI roda com --check e falha se o arquivo commitado estiver desatualizado.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.join(RAIZ, "tailwind", "v4.css");

const semComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const ler = (f) => semComentarios(readFileSync(path.join(RAIZ, "tokens", f), "utf8"));

const semantico = ler("semantico.css");

const tokens = [...semantico.matchAll(/^\s*(--hw-[\w-]+):/gm)].map((m) => m[1]);

/**
 * Cada namespace do @theme v4 gera uma FAMÍLIA de utilities diferente:
 * --color-x vira bg-x/text-x/border-x, --font-x vira font-x, --ease-x vira
 * ease-x. Namespace errado não é cosmético — publica a utility errada.
 *
 * Dois grupos ficam de fora de propósito:
 *
 * - focus-width e focus-offset: são medidas de um anel, não têm família de
 *   utility no v4. A folha de estilo consome var(--hw-focus-*) direto.
 * - duration-*: o v4 não tem namespace de duração no @theme (duration-200 usa
 *   valor nu). Consumir var(--hw-duration-*) direto no CSS é o caminho, e é o
 *   que preserva o tratamento de prefers-reduced-motion que já vive no token.
 */
const cores = [];
const fontes = [];

for (const t of tokens) {
  const nome = t.replace(/^--hw-/, "");
  if (nome.startsWith("font-")) fontes.push([nome.replace("font-", ""), t]);
  else if (nome.startsWith("focus-")) continue;
  else if (nome.startsWith("duration-")) continue;
  else cores.push([nome, t]);
}

/** Forma e movimento moram nos primitivos, não na semântica: não são decisão de
 *  papel, são a escala. Mas precisam de utility, então a ponte os publica. */
const raios = ["sm", "md", "lg", "full"].map((n) => [n, `--hw-radius-${n}`]);
const curvas = ["standard", "out"].map((n) => [n, `--hw-ease-${n}`]);

const bloco = (pares, prefixo) =>
  pares.map(([nome, token]) => `  --${prefixo}-${nome}: var(${token});`).join("\n");

const conteudo = `/**
 * GERADO por scripts/gerar-tema-v4.mjs — não edite à mão.
 * A fonte é tokens/semantico.css; rode o script depois de mexer nela.
 *
 * Ponte para consumidores em Tailwind v4. O @theme transforma cada entrada em
 * variável CSS E em utilitário: \`--color-primary\` vira \`bg-primary\`,
 * \`text-primary\`, \`border-primary\`.
 *
 *   @import "@hywork/ui/tokens/tema.css";
 *   @import "@hywork/ui/tailwind/v4.css";
 *
 * Quem está em v3 não importa isto — usa o preset em tailwind/v3-preset.cjs.
 *
 * Os valores referenciam a camada SEMÂNTICA (--hw-*), nunca primitivo: quem
 * muda a cara do produto é a decisão em semantico.css, e este arquivo só a
 * expõe ao Tailwind. Mapear direto para primitivo aqui seria pular a decisão.
 */

@theme inline {
${bloco(cores, "color")}

${bloco(fontes, "font")}

${bloco(raios, "radius")}

${bloco(curvas, "ease")}
}
`;

if (process.argv.includes("--check")) {
  const atual = readFileSync(SAIDA, "utf8");
  if (atual !== conteudo) {
    console.error(
      "FAIL tema v4: tailwind/v4.css está desatualizado.\n" +
        "  Rode: node scripts/gerar-tema-v4.mjs",
    );
    process.exit(1);
  }
} else {
  writeFileSync(SAIDA, conteudo);
}
