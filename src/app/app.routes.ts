import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page.component').then(
        (m) => m.ChatPageComponent,
      ),
  },
  
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  
];
