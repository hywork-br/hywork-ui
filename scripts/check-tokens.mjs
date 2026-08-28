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
const whiteLabel = semComentarios(ler("white-label.css"));

/**
 * 0. Nenhum par declarado pode ficar sem checagem por erro de digitação no
 *    nome. Um token que não resolve fazia o check imprimir "não consegui
 *    resolver" e seguir — que foi exatamente como o gate de contraste passou a
 *    não avaliar nada depois de um rename. Agora isso é falha dura.
 */

const CAMADAS_SEM_HEX = [
  ["semantico.css", semantico],
  ["admin.css", admin],
  ["portal.css", portal],
  ["white-label.css", whiteLabel],
];

// 1. Nenhum hex fora da camada de primitivos
for (const [nome, css] of CAMADAS_SEM_HEX) {
  const hex = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  if (hex.length) {
    falhas.push(
      `${nome}: ${hex.length} hex literal (${[...new Set(hex)].join(", ")}) — ` +
        `só primitivos.css pode ter valor; aqui vai var(--hw-*)`,
    );
  }
}

/**
 * 2. Toda referência resolve a um token declarado — e nenhum token se
 *    referencia a si mesmo. A auto-referência (`--x: var(--x)`) é o que um
 *    rename automatizado produz, não quebra o build, e deixa a propriedade
 *    vazia em runtime: a cor simplesmente não aplica.
 */
const declarados = new Set(
  [...`${primitivos}\n${semantico}`.matchAll(/^\s*(--hw-[\w-]+):/gm)].map((m) => m[1]),
);
for (const [nome, css] of [
  ["semantico.css", semantico],
  ["admin.css", admin],
  ["portal.css", portal],
  ["white-label.css", whiteLabel],
]) {
  const usados = [...css.matchAll(/var\((--hw-[\w-]+)\)/g)].map((m) => m[1]);
  const orfaos = [...new Set(usados)].filter((t) => !declarados.has(t));
  if (orfaos.length) {
    falhas.push(`${nome}: referência a token inexistente — ${orfaos.join(", ")}`);
  }

  const circulares = [...css.matchAll(/^\s*(--[\w-]+):\s*var\((--[\w-]+)\)/gm)]
    .filter((m) => m[1] === m[2])
    .map((m) => m[1]);
  if (circulares.length) {
    falhas.push(`${nome}: auto-referência (fica vazio em runtime) — ${circulares.join(", ")}`);
  }
}

/**
 * 2b. Token citado na documentação existe de verdade.
 *
 * Doc que ensina `var(--token-que-nao-existe)` é pior que doc faltando: quem
 * segue o exemplo obtém um elemento transparente e culpa o próprio código. Isso
 * aconteceu aqui — um rename deixou o AGENTS.md ensinando quatro tokens mortos,
 * e nada acusou, porque documentação não compila.
 */
const declaradosTodos = new Set(
  [...[primitivos, semantico, admin, portal, whiteLabel]
    .join("\n")
    .matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]),
);
for (const doc of ["README.md", "AGENTS.md", "CONTRIBUTING.md"]) {
  const texto = readFileSync(path.join(RAIZ, doc), "utf8");
  const citados = [...texto.matchAll(/`(--[\w-]+)`|var\((--[\w-]+)\)/g)].map(
    (m) => m[1] ?? m[2],
  );
  /* Doc pode citar --color-* (namespace da aplicação, mencionado ao explicar a
     fronteira) e um punhado de coisas que parecem token e não são: flag de CLI
     e placeholder de exemplo. Todo o resto tem que existir — qualquer outro
     prefixo é resíduo de rename, que foi como quatro tokens mortos ficaram
     documentados aqui. */
  const NAO_SAO_TOKENS = new Set(["--x", "--check", "--fresh", "--hw-"]);
  const mortos = [...new Set(citados)].filter(
    (t) => !declaradosTodos.has(t) && !t.startsWith("--color-") && !NAO_SAO_TOKENS.has(t),
  );
  if (mortos.length) {
    falhas.push(`${doc}: ensina token que não existe — ${mortos.join(", ")}`);
  }
}

/**
 * 2c. VOCABULÁRIO na camada de componentes.
 *
 * Os componentes vêm do shadcn, que nomeia os mesmos papéis de outro jeito:
 * `bg-background` onde aqui é `bg-surface`, `ring-ring` onde é o outline de
 * --hw-focus, `border-input` onde é --hw-border-strong. Portar é traduzir, e
 * a tradução se desfaz sozinha no primeiro componente colado às pressas.
 *
 * O que torna isso caro é o silêncio: `@apply bg-background` sem a entrada no
 * @theme não gera utility, não quebra build e não acusa no lint. A regra some
 * e o elemento fica transparente.
 *
 * Nome NU (var(--secondary), var(--radius-md)) tem um segundo problema, pior:
 * esse namespace pertence à APLICAÇÃO, e em produto white-label é onde a cor
 * escolhida pelo cliente é aplicada em runtime. Componente que lê dali herda a
 * cor do tenant onde deveria usar a da marca.
 */
const VOCABULARIO_ALHEIO = [
  "background",
  "foreground",
  "muted-foreground",
  "accent-foreground",
  "popover-foreground",
  "card-foreground",
  "primary-foreground",
  "secondary-foreground",
  "destructive",
  "input",
  "ring",
];
const UTILITY = "bg|text|border|ring|fill|stroke|outline|divide|from|to|via|placeholder|shadow";

const arquivosDeComponente = [
  ["tailwind/style-hywork.css", "tailwind/style-hywork.css"],
  ...["button", "input", "label", "badge"].map((c) => [
    `componentes/ui/${c}.tsx`,
    `componentes/ui/${c}.tsx`,
  ]),
];

for (const [rotulo, rel] of arquivosDeComponente) {
  const texto = semComentarios(readFileSync(path.join(RAIZ, rel), "utf8"));

  const alheias = [
    ...new Set(
      [...texto.matchAll(new RegExp(`\\b(?:${UTILITY})-(${VOCABULARIO_ALHEIO.join("|")})\\b`, "g"))]
        .map((m) => m[0]),
    ),
  ];
  if (alheias.length) {
    falhas.push(
      `${rotulo}: vocabulário do shadcn que este design system não publica — ` +
        `${alheias.join(", ")}. A utility não existe, e a regra some sem erro.`,
    );
  }

  /* Cor de token com modificador de opacidade: no v4 isso resolve em
     color-mix, e o resultado não é par bg/fg verificado nenhum. Onde o upstream
     usa /80 para hover, aqui existe token de hover declarado. */
  const opacidade = [
    ...new Set(
      [...texto.matchAll(new RegExp(`\\b(?:${UTILITY})-[a-z-]+\\/\\d+`, "g"))].map((m) => m[0]),
    ),
  ];
  if (opacidade.length) {
    falhas.push(
      `${rotulo}: cor com modificador de opacidade — ${opacidade.join(", ")}. ` +
        `Use o token de hover declarado; opacidade não passa pelo check de contraste.`,
    );
  }

  const nus = [
    ...new Set(
      [...texto.matchAll(/var\(\s*--(?!hw-)([\w-]+)\)/g)].map((m) => `--${m[1]}`),
    ),
  ];
  if (nus.length) {
    falhas.push(
      `${rotulo}: var() com nome nu — ${nus.join(", ")}. ` +
        `Esse namespace é da aplicação; em white-label é a cor do tenant.`,
    );
  }

  /* Altura fixa onde a superfície manda. É o que desliga a diferença entre
     admin (36px) e portal (48px) sem que nada acuse.

     Só conta a altura do PRÓPRIO controle: o lookbehind por `:` descarta o que
     vem atrás de variante — `file:h-6` é o botão interno do input e
     `[&_svg]:size-4` é o ícone. Ícone não escala com densidade neste sistema
     porque não existe token para isso; se um dia existir, é aqui que a regra
     muda. Sem essa distinção a guarda obrigaria a inventar o token para se
     calar, que é o oposto do que ela serve. */
  const alturas = [
    ...new Set(
      [...texto.matchAll(/(?<![:\w-])(?:min-h|h|size)-\d+(?:\.\d+)?\b/g)].map((m) => m[0]),
    ),
  ];
  if (alturas.length) {
    falhas.push(
      `${rotulo}: altura fixa — ${alturas.join(", ")}. ` +
        `Controle usa var(--hw-control-height*); número fixo desliga a camada de superfície.`,
    );
  }
}

/**
 * Falha estrutural aborta aqui. Sem isso, um token que se auto-referencia faz a
 * resolução de valor abaixo recursar até estourar a pilha, e o operador vê um
 * stack trace em vez da causa — que já foi diagnosticada duas linhas acima.
 */
if (falhas.length) {
  console.error("FAIL tokens:");
  for (const f of falhas) console.error(`  - ${f}`);
  process.exit(1);
}

// 3. Contraste dos pares bg/fg
const valorDe = (token, vistos = new Set()) => {
  if (vistos.has(token)) return null; // ciclo: já reportado acima
  vistos.add(token);
  const direto = primitivos.match(
    new RegExp(`^\\s*${token}:\\s*(#[0-9a-fA-F]{3,8})`, "m"),
  );
  if (direto) return direto[1];
  const ref = semantico.match(new RegExp(`^\\s*${token}:\\s*var\\((--hw-[\\w-]+)\\)`, "m"));
  return ref ? valorDe(ref[1], vistos) : null;
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
  ["--hw-primary", "--hw-primary-fg", 3.0, "botão primário"],
  ["--hw-secondary", "--hw-secondary-fg", 3.0, "botão secundário"],
  ["--hw-surface", "--hw-surface-fg", 4.5, "texto sobre superfície"],
  ["--hw-surface", "--hw-text-secondary", 4.5, "texto secundário"],
  ["--hw-surface", "--hw-text-muted", 4.5, "texto de apoio"],
  ["--hw-surface-inverse", "--hw-surface-inverse-fg", 4.5, "texto sobre base escura"],
  ["--hw-surface-inverse", "--hw-text-inverse-secondary", 4.5, "texto secundário no escuro"],
  ["--hw-surface-accent", "--hw-surface-accent-fg", 4.5, "texto sobre destaque"],
  ["--hw-surface-subtle", "--hw-surface-subtle-fg", 4.5, "texto sobre superfície sutil"],
  ["--hw-accent", "--hw-accent-fg", 4.5, "texto sobre hover de menu"],
  ["--hw-popover", "--hw-popover-fg", 4.5, "texto sobre superfície flutuante"],
  ["--hw-card", "--hw-card-fg", 4.5, "texto sobre cartão"],
  ["--hw-surface", "--hw-focus", 3.0, "anel de foco (WCAG 2.4.11)"],
  /* Borda de CONTROLE de formulário é elemento não-textual: piso 3,0 (WCAG
     1.4.11). Entra aqui porque --hw-border, que seria a escolha ingênua, dá
     1,23:1 — adequado para divisor, reprovado como única borda de um campo. Par
     ausente é par não verificado, e é assim que um input inacessível passa. */
  ["--hw-surface", "--hw-border-strong", 3.0, "borda de campo (WCAG 1.4.11)"],
  ["--hw-danger", "--hw-danger-fg", 3.0, "estado de erro"],
  ["--hw-warning", "--hw-warning-fg", 3.0, "estado de atenção"],
  ["--hw-success", "--hw-success-fg", 3.0, "estado de sucesso"],
  ["--hw-info", "--hw-info-fg", 3.0, "estado informativo"],
  ["--hw-danger-strong", "--hw-danger-strong-fg", 4.5, "erro sólido com texto pequeno"],
  ["--hw-muted-strong", "--hw-muted-strong-fg", 4.5, "neutro sólido com texto pequeno"],
  ["--hw-success-soft", "--hw-success-soft-fg", 4.5, "selo suave de sucesso"],
  ["--hw-warning-soft", "--hw-warning-soft-fg", 4.5, "selo suave de atenção"],
  ["--hw-danger-soft", "--hw-danger-soft-fg", 4.5, "selo suave de erro"],
  ["--hw-info-soft", "--hw-info-soft-fg", 4.5, "selo suave informativo"],
  ["--hw-neutral-soft", "--hw-neutral-soft-fg", 4.5, "selo suave neutro"],
];

for (const [bg, fg, piso, papel] of PARES) {
  const [vbg, vfg] = [valorDe(bg), valorDe(fg)];
  if (!vbg || !vfg) {
    /* Falha dura, e não aviso: um par que não resolve é um par que NÃO FOI
       checado. Tratar isso como ruído foi o que deixou o gate de contraste
       passar verde sem avaliar cor nenhuma depois de um rename. */
    falhas.push(
      `contraste ${papel}: token não resolve (${!vbg ? bg : fg}) — ` +
        `o par não foi verificado, o que é pior que reprovar`,
    );
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
