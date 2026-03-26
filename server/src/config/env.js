/**
 * Centraliza leitura de variáveis de ambiente (um único lugar, valores tipados).
 */
const toInt = (value, fallback) => {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
};

export const env = {
  port: toInt(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  sqlitePath: process.env.SQLITE_PATH,
  /** Se definido, POST /api/sync exige Authorization: Bearer <token> */
  syncToken: process.env.SYNC_TOKEN?.trim() || null,
  /** Origens permitidas no CORS (vírgula). Padrão: localhost Angular. */
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
