import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'features/incomes/edit/:id', renderMode: RenderMode.Server },
  { path: 'features/customers/edit/:id', renderMode: RenderMode.Server },
  { path: 'features/country/edit/:id', renderMode: RenderMode.Server },
  { path: 'features/location/edit/:id', renderMode: RenderMode.Server },
  { path: 'features/expense/edit/:id', renderMode: RenderMode.Server },
  { path: 'features/category/edit/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
