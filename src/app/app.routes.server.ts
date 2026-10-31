import { RenderMode, ServerRoute } from '@angular/ssr';
import { getAllPublicCatalogPaths } from './core/data/navigation.data';

function getSegmentsByDepth(depth: number): string[][] {
  return getAllPublicCatalogPaths()
    .map((path) => path.slice(1).split('/'))
    .filter((segments) => segments.length === depth);
}

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'search',
    renderMode: RenderMode.Server,
  },
  {
    path: ':p1',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return getSegmentsByDepth(1).map(([p1 = '']) => ({ p1 }));
    },
  },
  {
    path: ':p1/:p2',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return getSegmentsByDepth(2).map(([p1 = '', p2 = '']) => ({ p1, p2 }));
    },
  },
  {
    path: ':p1/:p2/:p3',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return getSegmentsByDepth(3).map(([p1 = '', p2 = '', p3 = '']) => ({ p1, p2, p3 }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
