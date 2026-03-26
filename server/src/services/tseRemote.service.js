import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import {
  candidatoCsvEntryName,
  cassacaoCsvEntryName,
  zipUrlConsultaCandidatos,
  zipUrlMotivoCassacao,
} from '../constants/tse.js';
import { HttpError } from '../errors/httpError.js';

const CSV_OPTIONS = {
  columns: true,
  delimiter: ';',
  relax_quotes: true,
  relax_column_count: true,
  bom: true,
};

async function fetchZipBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new HttpError(
      502,
      'Não foi possível obter os arquivos do TSE. Tente outro ano ou mais tarde.',
      { url, status: res.status },
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

function extractCsvFromZip(buffer, entryName) {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry(entryName);
  if (!entry) {
    const sample = zip
      .getEntries()
      .map((e) => e.entryName)
      .slice(0, 25)
      .join(', ');
    throw new HttpError(
      400,
      `Arquivo esperado não encontrado no ZIP do TSE: ${entryName}`,
      { amostraEntradas: sample },
    );
  }
  return entry.getData().toString('latin1');
}

function parseTseCsv(csvText) {
  return parse(csvText, CSV_OPTIONS);
}

/**
 * Baixa ZIPs oficiais, extrai CSV da UF (ou BRASIL) e retorna linhas parseadas.
 * @param {{ ano: number, scopeUf: string }} params - scopeUf: sigla da UF ou 'BRASIL'
 */
export async function fetchTseDatasets({ ano, scopeUf }) {
  const ufKey = scopeUf === 'BRASIL' ? 'BRASIL' : scopeUf;
  const candEntry = candidatoCsvEntryName(ano, ufKey);
  const cassEntry = cassacaoCsvEntryName(ano, ufKey);

  const candZipUrl = zipUrlConsultaCandidatos(ano);
  const cassZipUrl = zipUrlMotivoCassacao(ano);

  const [candBuf, cassBuf] = await Promise.all([
    fetchZipBuffer(candZipUrl),
    fetchZipBuffer(cassZipUrl),
  ]);

  const candCsv = extractCsvFromZip(candBuf, candEntry);
  const cassCsv = extractCsvFromZip(cassBuf, cassEntry);

  return {
    candidatos: parseTseCsv(candCsv),
    cassacoes: parseTseCsv(cassCsv),
    fontes: { candidatosZip: candZipUrl, cassacaoZip: cassZipUrl },
  };
}
