import { env } from '../../config/env.js';
import { HttpError } from '../../errors/httpError.js';

/**
 * Protege POST /api/sync quando SYNC_TOKEN está configurado.
 */
export function requireSyncToken(req, res, next) {
  if (!env.syncToken) {
    next();
    return;
  }

  const header = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();

  if (!token || token !== env.syncToken) {
    next(new HttpError(401, 'Token de sincronização inválido ou ausente.'));
    return;
  }

  next();
}
