import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BRAZIL_UFS } from '../../core/constants/brazil-ufs';
import type { CandidateListItem } from '../../core/models/candidate.models';
import { EleicaoApiService } from '../../core/services/eleicao-api.service';

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta.page.html',
  styleUrl: './consulta.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultaPageComponent implements OnInit {
  private readonly api = inject(EleicaoApiService);

  readonly ufs = BRAZIL_UFS;
  readonly anosEleicao = [2024, 2022, 2020, 2018, 2016, 2014];

  filtroNome = '';
  filtroUf = '';
  filtroAno: number | null = 2022;
  apenasRisco = false;

  readonly stats = signal({ candidatos: 0, cassacoes: 0 });
  readonly items = signal<CandidateListItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selected = signal<CandidateListItem | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly cassacoes = signal<
    { nrProcesso: string | null; tipoMotivo: string | null; motivo: string | null }[]
  >([]);
  readonly hasSearched = signal(false);

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (s) =>
        this.stats.set({
          candidatos: s.totalCandidatos,
          cassacoes: s.totalRegistrosCassacao,
        }),
      error: () => this.stats.set({ candidatos: 0, cassacoes: 0 }),
    });
  }

  buscar(): void {
    this.hasSearched.set(true);
    this.error.set(null);
    this.selected.set(null);
    this.cassacoes.set([]);
    this.loading.set(true);

    this.api
      .searchCandidates({
        q: this.filtroNome || undefined,
        uf: this.filtroUf || undefined,
        ano: this.filtroAno ?? undefined,
        onlyRisk: this.apenasRisco,
        limit: 50,
        offset: 0,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.total.set(res.total);
        },
        error: (err) => {
          this.items.set([]);
          this.total.set(0);
          this.error.set(err?.error?.error ?? 'Não foi possível carregar os candidatos.');
        },
      });
  }

  selecionar(row: CandidateListItem): void {
    this.selected.set(row);
    this.detailError.set(null);
    this.detailLoading.set(true);
    this.cassacoes.set([]);

    this.api
      .getCandidateDetail(row.sqCandidato, row.uf, row.anoEleicao)
      .pipe(finalize(() => this.detailLoading.set(false)))
      .subscribe({
        next: (d) => {
          this.selected.set(d.candidate);
          this.cassacoes.set(d.cassacoes);
        },
        error: (err) => {
          this.detailError.set(err?.error?.error ?? 'Detalhe indisponível.');
        },
      });
  }

  fecharDetalhe(): void {
    this.selected.set(null);
    this.cassacoes.set([]);
    this.detailError.set(null);
  }

  temAlerta(row: CandidateListItem): boolean {
    return Boolean(row.temCassacao) || this.situacaoSugereCassacao(row.situacao);
  }

  private situacaoSugereCassacao(situacao: string | null | undefined): boolean {
    if (!situacao) return false;
    return situacao.toUpperCase().includes('CASS');
  }
}
