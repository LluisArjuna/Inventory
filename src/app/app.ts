import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  private readonly router = inject(Router);
  protected readonly showCreateDialog = signal(false);

  protected onSearch(query: string): void {
    this.router.navigate(['/'], {
      queryParams: { search: query || undefined },
      queryParamsHandling: 'merge'
    });
  }
}
