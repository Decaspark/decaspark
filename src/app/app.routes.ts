import { CanMatchFn, Routes, UrlSegment } from '@angular/router';
import { resolveCatalogRoute } from './core/data/navigation.data';
import { ShellComponent } from './layouts/shell/shell.component';

export const catalogRouteCanMatch: CanMatchFn = (_route, segments: UrlSegment[]) => {
  if (segments.length === 0) return false;
  const candidatePath = '/' + segments.map((s) => s.path).join('/');
  return resolveCatalogRoute(candidatePath) !== null;
};

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search-page.component').then((m) => m.SearchPageComponent),
      },
      {
        path: ':p1',
        canMatch: [catalogRouteCanMatch],
        loadComponent: () =>
          import('./features/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
      },
      {
        path: ':p1/:p2',
        canMatch: [catalogRouteCanMatch],
        loadComponent: () =>
          import('./features/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
      },
      {
        path: ':p1/:p2/:p3',
        canMatch: [catalogRouteCanMatch],
        loadComponent: () =>
          import('./features/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found-page.component').then(
            (m) => m.NotFoundPageComponent,
          ),
      },
    ],
  },
];
