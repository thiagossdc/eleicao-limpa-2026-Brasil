import { TSE_ELECTION_YEAR } from '../constants/tse.js';
import { HttpError } from '../errors/httpError.js';
import { importTseRowsInTransaction } from '../repositories/tseImport.repository.js';
import { fetchTseDatasets } from './tseRemote.service.js';

function normalizeUf(uf) {
  const u = String(uf || '').trim().toUpperCase();
  if (!u) throw new HttpError(400, 'Informe a UF (ex.: SP) ou BRASIL para o arquivo nacional.');
  if (u === 'BR') return 'BRASIL';
  return u;
}

function assertAno(ano) {
  const y = Number(ano);
  if (!Number.isFinite(y) || y < TSE_ELECTION_YEAR.min || y > TSE_ELECTION_YEAR.max) {
    throw new HttpError(
      400,
      `Ano da eleição inválido. Use um valor entre ${TSE_ELECTION_YEAR.min} e ${TSE_ELECTION_YEAR.max}.`,
    );
  }
  return y;
}

/**
 * Sincroniza candidatos e motivos de cassação a partir dos ZIPs do TSE.
 * @param {{ ano: number, uf: string }} input
 */
export async function syncFromTse(input) {
  const ano = assertAno(input.ano);
  const scopeUf = normalizeUf(input.uf);

  const { candidatos, cassacoes, fontes } = await fetchTseDatasets({ ano, scopeUf });

  const { candidatosInseridos, cassacoesInseridas } = importTseRowsInTransaction({
    candidatos,
    cassacoes,
    ano,
    scopeUf,
  });

  return {
    ano,
    uf: scopeUf,
    candidatosProcessados: candidatosInseridos,
    registrosCassacaoProcessados: cassacoesInseridas,
    fontes,
  };
}
