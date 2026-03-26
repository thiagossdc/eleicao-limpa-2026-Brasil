/** Resposta paginada da API de candidatos */
export interface CandidateListResponse {
  items: CandidateListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CandidateListItem {
  id: number;
  anoEleicao: number;
  uf: string;
  sqCandidato: string;
  nome: string;
  nomeUrna: string | null;
  cpf: string | null;
  cargo: string | null;
  partido: string | null;
  nomePartido: string | null;
  situacao: string | null;
  eleicao: string | null;
  temCassacao: number | boolean;
}

export interface CassacaoItem {
  nrProcesso: string | null;
  tipoMotivo: string | null;
  motivo: string | null;
}

export interface CandidateDetailResponse {
  candidate: CandidateListItem;
  cassacoes: CassacaoItem[];
}

export interface DatasetStats {
  totalCandidatos: number;
  totalRegistrosCassacao: number;
}

export interface SyncResponse {
  ok: boolean;
  ano: number;
  uf: string;
  candidatosProcessados: number;
  registrosCassacaoProcessados: number;
  fontes: {
    candidatosZip: string;
    cassacaoZip: string;
  };
}
