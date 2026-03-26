import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { env } from './config/env.js';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = env.sqlitePath || path.join(dataDir, 'eleicao.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ano_eleicao INTEGER NOT NULL,
    sg_uf TEXT NOT NULL,
    sq_candidato TEXT NOT NULL,
    nm_candidato TEXT NOT NULL,
    nm_urna TEXT,
    nr_cpf TEXT,
    ds_cargo TEXT,
    sg_partido TEXT,
    nm_partido TEXT,
    ds_situacao TEXT,
    ds_eleicao TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (ano_eleicao, sg_uf, sq_candidato)
  );

  CREATE TABLE IF NOT EXISTS cassacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ano_eleicao INTEGER NOT NULL,
    sg_uf TEXT NOT NULL,
    sq_candidato TEXT NOT NULL,
    nr_processo TEXT,
    ds_tp_motivo TEXT,
    ds_motivo TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (ano_eleicao, sg_uf, sq_candidato, nr_processo, ds_motivo)
  );

  CREATE INDEX IF NOT EXISTS idx_candidates_search
    ON candidates (ano_eleicao, sg_uf, nm_candidato);
  CREATE INDEX IF NOT EXISTS idx_cassacoes_sq
    ON cassacoes (ano_eleicao, sg_uf, sq_candidato);
`);
