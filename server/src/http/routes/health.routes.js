import { Router } from 'express';
import { getDatasetStats } from '../../repositories/candidateRead.repository.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.json({ ok: true, service: 'eleicao-limpa-api' });
});

healthRouter.get('/stats', (req, res) => {
  res.json(getDatasetStats());
});
