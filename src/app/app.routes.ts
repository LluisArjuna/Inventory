import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';
import { Login } from '@features/auth/login/login';
import { Register } from '@features/auth/register/register';
import { MyInventories } from '@features/inventories/my-inventories/my-inventories';
import { EditInventory } from '@features/inventories/edit-inventory/edit-inventory';
import { InventoryDetail } from '@features/inventories/inventory-detail/inventory-detail';
import { InventoryMap } from '@features/inventories/inventory-map/inventory-map';
import { InventoryStats } from '@features/inventories/inventory-stats/inventory-stats';
import { PublicInventories } from '@features/inventories/public-inventories/public-inventories';
import { EditItem } from '@features/items/edit-item/edit-item';
import { ItemDetail } from '@features/items/item-detail/item-detail';

export const routes: Routes = [
  {
    path: '',
    component: PublicInventories
  },
  {
    path: 'my-inventories',
    component: MyInventories,
    canActivate: [authGuard]
  },
  {
    path: 'inventories/:id/edit',
    component: EditInventory,
    canActivate: [authGuard]
  },
  {
    path: 'inventories/:id/map',
    component: InventoryMap
  },
  {
    path: 'inventories/:id/stats',
    component: InventoryStats
  },
  {
    path: 'inventories/:id',
    component: InventoryDetail
  },
  {
    path: 'items/:id/edit',
    component: EditItem,
    canActivate: [authGuard]
  },
  {
    path: 'items/:id',
    component: ItemDetail
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  }
];
