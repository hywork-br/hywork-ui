#!/usr/bin/env node
/**
 * Prova de vida dos tokens. Silencioso quando saudável; imprime FAIL e sai 1
 * quando algo quebra.
 *
 * Três coisas que só um script pega:
 *
 * 1. Hex escrito na camada semântica — ali só pode haver referência a
 *    primitivo. Hex ali é primitivo que faltou, e é assim que a camada começa a
 *    apodrecer.
 * 2. Referência a token que não existe. `var(--hw-azul)` num arquivo em que o
 *    primitivo se chama `--hw-blue-mid` não quebra nada em runtime: a cor
 *    simplesmente não aplica, e ninguém nota até a tela ficar transparente.
 * 3. Contraste dos pares bg/fg declarados. É a única checagem aqui que julga a
 *    DECISÃO e não a mecânica — se alguém trocar a primária por uma cor que
 *    reprova, o CI diz antes do usuário.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ler = (f) => readFileSync(path.join(RAIZ, "tokens", f), "utf8");

const falhas = [];

/** Remove comentários antes de qualquer análise: a explicação de por que um hex
 *  não pode estar ali contém, ela mesma, um hex. Guard que lê prosa se acusa. */
const semComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const primitivos = semComentarios(ler("primitivos.css"));
const semantico = semComentarios(ler("semantico.css"));
const admin = semComentarios(ler("admin.css"));
const portal = semComentarios(ler("portal.css"));

// 1. Nenhum hex fora da camada de primitivos
for (const [nome, css] of [
  ["semantico.css", semantico],
  ["admin.css", admin],
  ["portal.css", portal],
]) {
  const hex = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  if (hex.length) {
    falhas.push(
      `${nome}: ${hex.length} hex literal (${[...new Set(hex)].join(", ")}) — ` +
        `só primitivos.css pode ter valor; aqui vai var(--hw-*)`,
    );
  }
}

// 2. Toda referência --hw-* resolve a um primitivo declarado
const declarados = new Set(
  [...primitivos.matchAll(/^\s*(--hw-[\w-]+):/gm)].map((m) => m[1]),
);
for (const [nome, css] of [
  ["semantico.css", semantico],
  ["admin.css", admin],
  ["portal.css", portal],
]) {
  const usados = [...css.matchAll(/var\((--hw-[\w-]+)\)/g)].map((m) => m[1]);
  const orfaos = [...new Set(usados)].filter((t) => !declarados.has(t));
  if (orfaos.length) {
    falhas.push(`${nome}: referência a primitivo inexistente — ${orfaos.join(", ")}`);
  }
}

// 3. Contraste dos pares bg/fg
const valorDe = (token) => {
  const direto = primitivos.match(
    new RegExp(`^\\s*${token}:\\s*(#[0-9a-fA-F]{3,8})`, "m"),
  );
  if (direto) return direto[1];
  const ref = semantico.match(new RegExp(`^\\s*${token}:\\s*var\\((--hw-[\\w-]+)\\)`, "m"));
  return ref ? valorDe(ref[1]) : null;
};

const canal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminancia = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};
const razao = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** Pares que precisam passar, e o piso de cada um.
 *  4.5 = texto corrido (AA) · 3.0 = texto grande, ícone e anel de foco. */
const PARES = [
  ["--color-primary", "--color-primary-fg", 3.0, "botão primário"],
  ["--color-secondary", "--color-secondary-fg", 3.0, "botão secundário"],
  ["--color-surface", "--color-surface-fg", 4.5, "texto sobre superfície"],
  ["--color-surface", "--color-texto-secundario", 4.5, "texto secundário"],
  ["--color-surface-inversa", "--color-surface-inversa-fg", 4.5, "texto sobre base escura"],
  ["--color-surface-destaque", "--color-surface-destaque-fg", 4.5, "texto sobre destaque"],
  ["--color-surface", "--color-foco", 3.0, "anel de foco (WCAG 2.4.11)"],
  ["--color-erro", "--color-erro-fg", 3.0, "estado de erro"],
  ["--color-atencao", "--color-atencao-fg", 3.0, "estado de atenção"],
];

for (const [bg, fg, piso, papel] of PARES) {
  const [vbg, vfg] = [valorDe(bg), valorDe(fg)];
  if (!vbg || !vfg) {
    falhas.push(`contraste: não consegui resolver ${bg} ou ${fg} (${papel})`);
    continue;
  }
  const r = razao(vbg, vfg);
  if (r < piso) {
    falhas.push(
      `contraste ${papel}: ${vbg} sobre ${vfg} dá ${r.toFixed(2)}:1, ` +
        `abaixo do piso de ${piso}:1`,
    );
  }
}

if (falhas.length) {
  console.error("FAIL tokens:");
  for (const f of falhas) console.error(`  - ${f}`);
  process.exit(1);
}
