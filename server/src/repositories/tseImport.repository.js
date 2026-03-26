import { db } from '../db.js';
import { TSE_CSV } from '../constants/tse.js';

const C = TSE_CSV.candidato;
const K = TSE_CSV.cassacao;

const insertCandidate = db.prepare(`
  INSERT INTO candidates (
    ano_eleicao, sg_uf, sq_candidato, nm_candidato, nm_urna, nr_cpf,
    ds_cargo, sg_partido, nm_partido, ds_situacao, ds_eleicao
  ) VALUES (
    @ano_eleicao, @sg_uf, @sq_candidato, @nm_candidato, @nm_urna, @nr_cpf,
    @ds_cargo, @sg_partido, @nm_partido, @ds_situacao, @ds_eleicao
  )
  ON CONFLICT(ano_eleicao, sg_uf, sq_candidato) DO UPDATE SET
    nm_candidato = excluded.nm_candidato,
    nm_urna = excluded.nm_urna,
    nr_cpf = excluded.nr_cpf,
    ds_cargo = excluded.ds_cargo,
    sg_partido = excluded.sg_partido,
    nm_partido = excluded.nm_partido,
    ds_situacao = excluded.ds_situacao,
    ds_eleicao = excluded.ds_eleicao,
    updated_at = datetime('now')
`);

const insertCassacao = db.prepare(`
  INSERT INTO cassacoes (
    ano_eleicao, sg_uf, sq_candidato, nr_processo, ds_tp_motivo, ds_motivo
  ) VALUES (
    @ano_eleicao, @sg_uf, @sq_candidato, @nr_processo, @ds_tp_motivo, @ds_motivo
  )
  ON CONFLICT(ano_eleicao, sg_uf, sq_candidato, nr_processo, ds_motivo) DO NOTHING
`);

function mapCandidateRow(raw, anoEleicao, scopeUf) {
  const rowUf = String(raw[C.SG_UF] ?? '').trim();
  if (scopeUf !== 'BRASIL' && rowUf !== scopeUf) return null;

  const sq = String(raw[C.SQ_CANDIDATO] ?? '').trim();
  if (!sq) return null;

  return {
    ano_eleicao: Number(raw[C.ANO_ELEICAO]) || anoEleicao,
    sg_uf: rowUf || scopeUf,
    sq_candidato: sq,
    nm_candidato: String(raw[C.NM_CANDIDATO] ?? '').trim(),
    nm_urna: String(raw[C.NM_URNA_CANDIDATO] ?? '').trim() || null,
    nr_cpf: String(raw[C.NR_CPF_CANDIDATO] ?? '').replace(/\D/g, '') || null,
    ds_cargo: String(raw[C.DS_CARGO] ?? '').trim() || null,
    sg_partido: String(raw[C.SG_PARTIDO] ?? '').trim() || null,
    nm_partido: String(raw[C.NM_PARTIDO] ?? '').trim() || null,
    ds_situacao: String(raw[C.DS_SITUACAO_CANDIDATURA] ?? '').trim() || null,
    ds_eleicao: String(raw[C.DS_ELEICAO] ?? '').trim() || null,
  };
}

function mapCassacaoRow(raw, anoEleicao, scopeUf) {
  const rowUf = String(raw[K.SG_UF] ?? '').trim();
  if (scopeUf !== 'BRASIL' && rowUf !== scopeUf) return null;

  const sq = String(raw[K.SQ_CANDIDATO] ?? '').trim();
  if (!sq) return null;

  return {
    ano_eleicao: Number(raw[K.ANO_ELEICAO]) || anoEleicao,
    sg_uf: rowUf || scopeUf,
    sq_candidato: sq,
    nr_processo: String(raw[K.NR_PROCESSO] ?? '').trim() || null,
    ds_tp_motivo: String(raw[K.DS_TP_MOTIVO] ?? '').trim() || null,
    ds_motivo: String(raw[K.DS_MOTIVO] ?? '').trim() || null,
  };
}

/**
 * Importa linhas já parseadas do CSV TSE dentro de uma transação.
 * @param {{ candidatos: object[], cassacoes: object[], ano: number, scopeUf: string }} payload
 * @returns {{ candidatosInseridos: number, cassacoesInseridas: number }}
 */
export function importTseRowsInTransaction({ candidatos, cassacoes, ano, scopeUf }) {
  const run = () => {
    let candidatosInseridos = 0;
    for (const raw of candidatos) {
      const row = mapCandidateRow(raw, ano, scopeUf);
      if (!row) continue;
      insertCandidate.run(row);
      candidatosInseridos += 1;
    }

    let cassacoesInseridas = 0;
    for (const raw of cassacoes) {
      const row = mapCassacaoRow(raw, ano, scopeUf);
      if (!row) continue;
      insertCassacao.run(row);
      cassacoesInseridas += 1;
    }

    return { candidatosInseridos, cassacoesInseridas };
  };

  return db.transaction(run)();
}
