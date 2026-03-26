import { HttpError } from '../../errors/httpError.js';

function logServerError(err, req) {
  console.error('[api]', req.method, req.path, err);
}

/**
 * Middleware Express: captura erros e devolve JSON consistente.
 */
export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details && process.env.NODE_ENV !== 'production' ? { details: err.details } : {}),
    });
    return;
  }

  logServerError(err, req);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Erro interno no servidor.'
      : err.message || 'Erro interno no servidor.';
  res.status(500).json({ error: message });
}
