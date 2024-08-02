import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    pathMatch: 'full',
  },
  {
    path: 'test',
    loadComponent: async () => (await import('./lazy-component/lazy-component.component')).LazyComponentComponent,
  },
  {
    path: 'test2',
    loadComponent: async () => (await import('./lazy2/lazy2.component')).Lazy2Component,
  }
];

