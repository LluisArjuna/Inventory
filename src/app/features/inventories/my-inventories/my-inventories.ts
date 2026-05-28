import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { InventoryCard } from '@shared/components/inventory-card/inventory-card';
import type { Inventory, Page } from '@shared/models';
import { SkeletonCard } from "@shared/components/skeleton-card/skeleton-card";
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-my-inventories',
  imports: [InventoryCard, SkeletonCard, Pagination],
  templateUrl: './my-inventories.html'
})
export class MyInventories implements OnInit {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  private readonly inventoriesService = inject(InventoriesService);

  readonly inventories = signal<Inventory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);

  readonly isDeleting = signal<Set<string>>(new Set());
  readonly toggling = signal<Set<string>>(new Set());

  readonly isEmpty = computed(() => !this.loading() && this.inventories().length === 0);

  ngOnInit(): void {
    this.loadInventories();
  }

  protected loadInventories(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    this.inventoriesService.getByUserId(user.id, this.currentPage()).subscribe({
      next: (page: Page<Inventory>) => {
        this.inventories.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load inventories');
        this.loading.set(false);
      }
    });
  }

  onToggleVisibility(id: string): void {
    const inventory = this.inventories().find(i => i.id === id);
    if (!inventory) return;

    this.toggling.update(s => new Set(s).add(id));

    this.inventoriesService.toggleVisibility(id, !inventory.isPublic).subscribe({
      next: () => {
        this.toggling.update(s => { s.delete(id); return new Set(s); });
        this.inventories.update(list =>
          list.map(i => i.id === id ? { ...i, isPublic: !i.isPublic } : i)
        );
      },
      error: () => {
        this.toggling.update(s => { s.delete(id); return new Set(s); });
      }
    });
  }

  onEdit(id: string): void {
    this.router.navigate(['/inventories', id, 'edit']);
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this inventory?')) return;

    this.isDeleting.update(s => new Set(s).add(id));

    this.inventoriesService.delete(id).subscribe({
      next: () => {
        this.isDeleting.update(s => { s.delete(id); return new Set(s); });
        this.inventories.update(list => list.filter(i => i.id !== id));
      },
      error: () => {
        this.isDeleting.update(s => { s.delete(id); return new Set(s); });
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadInventories();
  }
}
