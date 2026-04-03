import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products').then(m => m.Products)
  },
  {
    path: 'sales',
    loadComponent: () => import('./sales/sales').then(m => m.Sales)
  },
  {
    path: 'investments',
    loadComponent: () => import('./investments/investments').then(m => m.Investments)
  },
  {
    path: 'expenses',
    loadComponent: () => import('./expenses/expenses').then(m => m.Expenses)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then(m => m.Settings)
  }
];
