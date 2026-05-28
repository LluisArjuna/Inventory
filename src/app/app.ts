import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@shared/components/navbar/navbar';
import { CreateInventory } from '@features/inventories/create-inventory/create-inventory';
import { ToastContainer } from '@shared/components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CreateInventory, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly showCreateDialog = signal(false);
}
