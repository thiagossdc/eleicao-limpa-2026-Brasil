import { HttpError } from '../../errors/httpError.js';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'sim']);

export function parseOptionalInt(value, label) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) {
    throw new HttpError(400, `Parâmetro inválido: ${label}`);
  }
  return n;
}

export function parseOptionalString(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

export function parseBooleanQuery(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return TRUE_VALUES.has(String(value).trim().toLowerCase());
}

export function parsePagination(query, defaults = { limit: 30, max: 100 }) {
  const limitRaw = parseOptionalInt(query.limit, 'limit');
  const offsetRaw = parseOptionalInt(query.offset, 'offset');

  let limit = limitRaw ?? defaults.limit;
  if (limit < 1) limit = defaults.limit;
  if (limit > defaults.max) limit = defaults.max;

  let offset = offsetRaw ?? 0;
  if (offset < 0) offset = 0;

  return { limit, offset };
}
