import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@shared/components/navbar/navbar';
import { CreateInventory } from '@features/inventories/create-inventory/create-inventory';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CreateInventory],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly showCreateDialog = signal(false);
}
