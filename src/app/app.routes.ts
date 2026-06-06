import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/inventories/public-inventories/public-inventories').then(m => m.PublicInventories)
  },
  {
    path: 'my-inventories',
    loadComponent: () => import('@features/inventories/my-inventories/my-inventories').then(m => m.MyInventories),
    canActivate: [authGuard]
  },
  {
    path: 'inventories/:id/edit',
    loadComponent: () => import('@features/inventories/edit-inventory/edit-inventory').then(m => m.EditInventory),
    canActivate: [authGuard]
  },
  {
    path: 'inventories/:id/map',
    loadComponent: () => import('@features/inventories/inventory-map/inventory-map').then(m => m.InventoryMap)
  },
  {
    path: 'inventories/:id/stats',
    loadComponent: () => import('@features/inventories/inventory-stats/inventory-stats').then(m => m.InventoryStats)
  },
  {
    path: 'inventories/:id',
    loadComponent: () => import('@features/inventories/inventory-detail/inventory-detail').then(m => m.InventoryDetail)
  },
  {
    path: 'items/:id/edit',
    loadComponent: () => import('@features/items/edit-item/edit-item').then(m => m.EditItem),
    canActivate: [authGuard]
  },
  {
    path: 'items/:id',
    loadComponent: () => import('@features/items/item-detail/item-detail').then(m => m.ItemDetail)
  },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('@features/auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  }
];
