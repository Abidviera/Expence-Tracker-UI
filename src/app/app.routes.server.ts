import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // All edit/create/detail routes must use Server mode (SSR)
    // because they contain dynamic IDs that cannot be pre-rendered at build time.
    path: 'features/incomes/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'features/customers/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'features/country/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'features/location/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'features/expense/edit/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    // Default: pre-render static routes, fall back to client for everything else
    renderMode: RenderMode.Prerender,
  },
];