import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/**
 * Gate de segurança do CI e do release: falha em qualquer aviso alto ou crítico
 * do `npm audit`, menos os desta lista. Cada exceção diz por que não há o que
 * instalar e até quando vale; vencida a data, o gate volta a falhar e obriga a
 * reavaliar — a exceção não vira esquecimento.
 */
export const allowlist = [
  {
    id: 'GHSA-vfj7-8cjw-p6xm',
    package: 'braces',
    reason:
      'Sem versão corrigida: todo braces 3.x é afetado (3.0.3 é a última) e só sai com o Tailwind 4, ' +
      'que quebra os presets e os dois consumidores. Chega pelo Tailwind 3 (chokidar, micromatch), ' +
      'que o tailwindcss-animate exige; é negação de serviço com padrão de glob aninhado, e quem ' +
      'controla os globs é a configuração do próprio build.',
    reviewBy: '2026-12-31',
  },
];

const BLOCKING = new Set(['high', 'critical']);

const advisoryId = (url) => url?.split('/').pop();

/** Avisos altos ou críticos que barram o gate: os do audit menos a lista, e as exceções vencidas. */
export function blockingAdvisories(report, exceptions = allowlist, today = new Date().toISOString().slice(0, 10)) {
  const active = new Set(exceptions.filter((e) => e.reviewBy >= today).map((e) => e.id));
  const found = new Map();
  for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    // Entrada só com nomes em `via` é efeito de outro pacote: o aviso está nele.
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== 'object' || !BLOCKING.has(via.severity)) continue;
      const id = advisoryId(via.url) ?? String(via.source);
      if (!active.has(id)) found.set(id, `${via.name}: ${via.title} (${via.url})`);
    }
  }
  return [...found.values()];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let output;
  try {
    output = execFileSync('npm', ['audit', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    // `npm audit` sai com 1 quando acha qualquer aviso; o JSON vem mesmo assim.
    output = error.stdout;
  }
  const blocking = blockingAdvisories(JSON.parse(output));
  for (const exception of allowlist) console.log(`exceção ${exception.id} (${exception.package}) até ${exception.reviewBy}`);
  if (blocking.length > 0) {
    console.error(`${blocking.length} aviso(s) alto(s) ou crítico(s) sem exceção:\n- ${blocking.join('\n- ')}`);
    process.exit(1);
  }
  console.log('PASS npm audit: nenhum aviso alto ou crítico fora das exceções');
}
