// Aritmética de data sobre a string 'YYYY-MM-DD', sem fuso.
//
// O valor do DatePicker é uma data de calendário, não um instante: "12/10/2026"
// é o mesmo dia em qualquer fuso. Toda conta passa por Date.UTC e getUTC*, que
// não sofrem horário de verão nem deslocamento do navegador. `new Date('2026-10-12')`
// seria meia-noite UTC — e 11/10 às 21h em Brasília.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const WEEKDAYS = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado",
];
/** Cabeçalho do calendário, de domingo a sábado — a semana como se lê no Brasil. */
export const WEEKDAY_HEADERS = WEEKDAYS.map((nome, i) => ({
  short: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][i],
  long: nome,
}));

const pad = (n: number, size = 2) => String(n).padStart(size, "0");

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function fromUtc(date: Date): string {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function toParts(iso: string): { year: number; month: number; day: number } {
  const [, y, m, d] = ISO.exec(iso)!;
  return { year: Number(y), month: Number(m), day: Number(d) };
}

export function fromParts(year: number, month: number, day: number): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** Data de calendário que existe: rejeita 31/02 e 2026-13-01. */
export function isValidIso(value: string | null | undefined): value is string {
  if (!value || !ISO.test(value)) return false;
  const { year, month, day } = toParts(value);
  return year >= 1000 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function addDays(iso: string, amount: number): string {
  const { year, month, day } = toParts(iso);
  return fromUtc(new Date(Date.UTC(year, month - 1, day + amount)));
}

/** Soma meses mantendo o dia, ou o último do mês quando ele não existe (31/01 + 1 → 28/02). */
export function addMonths(iso: string, amount: number): string {
  const { year, month, day } = toParts(iso);
  const alvo = new Date(Date.UTC(year, month - 1 + amount, 1));
  const y = alvo.getUTCFullYear();
  const m = alvo.getUTCMonth() + 1;
  return fromParts(y, m, Math.min(day, daysInMonth(y, m)));
}

/** 0 = domingo. */
export function weekday(iso: string): number {
  const { year, month, day } = toParts(iso);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export const startOfWeek = (iso: string) => addDays(iso, -weekday(iso));
export const endOfWeek = (iso: string) => addDays(iso, 6 - weekday(iso));

/** Strings ISO comparam por ordem lexicográfica. */
export function isInRange(iso: string, min?: string, max?: string): boolean {
  return !(min && iso < min) && !(max && iso > max);
}

export function clamp(iso: string, min?: string, max?: string): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** 'YYYY-MM-DD' → 'dd/mm/aaaa'. */
export function isoToDisplay(iso: string): string {
  const { year, month, day } = toParts(iso);
  return `${pad(day)}/${pad(month)}/${pad(year, 4)}`;
}

/** 'dd/mm/aaaa' → 'YYYY-MM-DD', ou null se o texto não é uma data que existe. */
export function displayToIso(text: string): string | null {
  const partes = DISPLAY.exec(text.trim());
  if (!partes) return null;
  const iso = `${partes[3]}-${partes[2]}-${partes[1]}`;
  return isValidIso(iso) ? iso : null;
}

/**
 * Máscara de digitação: fica só com os dígitos e põe as barras.
 * "1210" → "12/10", "12102026" → "12/10/2026". Colar "12/10/2026" funciona igual.
 */
export function maskDisplay(raw: string): string {
  const digitos = raw.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** "outubro de 2026". */
export function monthLabel(iso: string): string {
  const { year, month } = toParts(iso);
  return `${MONTHS[month - 1]} de ${year}`;
}

/** "segunda-feira, 12 de outubro de 2026" — o nome acessível de cada dia. */
export function dayLabel(iso: string): string {
  const { year, month, day } = toParts(iso);
  return `${WEEKDAYS[weekday(iso)]}, ${day} de ${MONTHS[month - 1]} de ${year}`;
}

/** Hoje no relógio de quem usa — só para marcar o dia e abrir o calendário nele. */
export function todayIso(): string {
  const agora = new Date();
  return fromParts(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());
}
