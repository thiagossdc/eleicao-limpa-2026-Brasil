import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/consulta/consulta.page').then((m) => m.ConsultaPageComponent),
  },
  {
    path: 'sync',
    loadComponent: () => import('./features/sync/sync.page').then((m) => m.SyncPageComponent),
  },
  { path: '**', redirectTo: '' },
];
