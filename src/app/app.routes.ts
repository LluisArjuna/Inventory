import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';
import { Login } from '@features/auth/login/login';
import { Register } from '@features/auth/register/register';
import { MyInventories } from '@features/inventories/my-inventories/my-inventories';
import { EditInventory } from '@features/inventories/edit-inventory/edit-inventory';
import { PublicInventories } from '@features/inventories/public-inventories/public-inventories';

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
