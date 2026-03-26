/**
 * Erro HTTP tipado para respostas consistentes na API.
 */
export class HttpError extends Error {
  /**
   * @param {number} status - Código HTTP
   * @param {string} message - Mensagem segura para o cliente
   * @param {object} [details] - Opcional (ex.: erros de validação)
   */
  constructor(status, message, details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}
