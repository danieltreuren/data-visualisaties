import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'charts/:type',
    loadComponent: () =>
      import('./pages/chart-detail/chart-detail.component').then(m => m.ChartDetailComponent),
  },
  {
    path: 'palet-editor',
    loadComponent: () =>
      import('./pages/palette-builder/palette-builder.component').then(m => m.PaletteBuilderComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
