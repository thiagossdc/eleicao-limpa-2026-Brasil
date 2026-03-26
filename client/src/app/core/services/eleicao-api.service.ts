import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CandidateDetailResponse,
  CandidateListResponse,
  DatasetStats,
  SyncResponse,
} from '../models/candidate.models';

export interface CandidateSearchParams {
  q?: string;
  uf?: string;
  ano?: number;
  onlyRisk?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable({ providedIn: 'root' })
export class EleicaoApiService {
  private readonly http = inject(HttpClient);
  /** Em dev o proxy encaminha /api para o Node; em prod configure o mesmo host ou URL absoluta. */
  private readonly apiPrefix = '/api';

  getStats(): Observable<DatasetStats> {
    return this.http.get<DatasetStats>(`${this.apiPrefix}/stats`);
  }

  searchCandidates(params: CandidateSearchParams): Observable<CandidateListResponse> {
    let httpParams = new HttpParams();
    if (params.q?.trim()) httpParams = httpParams.set('q', params.q.trim());
    if (params.uf?.trim()) httpParams = httpParams.set('uf', params.uf.trim().toUpperCase());
    if (params.ano != null) httpParams = httpParams.set('ano', String(params.ano));
    if (params.onlyRisk) httpParams = httpParams.set('onlyRisk', 'true');
    if (params.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params.offset != null) httpParams = httpParams.set('offset', String(params.offset));

    return this.http.get<CandidateListResponse>(`${this.apiPrefix}/candidates`, { params: httpParams });
  }

  getCandidateDetail(sqCandidato: string, uf: string, ano: number): Observable<CandidateDetailResponse> {
    const params = new HttpParams().set('uf', uf).set('ano', String(ano));
    return this.http.get<CandidateDetailResponse>(`${this.apiPrefix}/candidates/${sqCandidato}`, { params });
  }

  syncTse(body: { ano: number; uf: string }, syncToken?: string): Observable<SyncResponse> {
    const token = syncToken?.trim();
    return this.http.post<SyncResponse>(`${this.apiPrefix}/sync`, body, {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined,
    });
  }
}
