import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { InventoriesService } from '../services/inventories.service';
import { InventoryCard } from '@shared/components/inventory-card/inventory-card';
import { SkeletonCard } from '@shared/components/skeleton-card/skeleton-card';
import type { Inventory } from '@shared/models';

@Component({
  selector: 'app-public-inventories',
  imports: [InventoryCard, SkeletonCard],
  templateUrl: './public-inventories.html'
})
export class PublicInventories implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);

  readonly inventories = signal<Inventory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);

  readonly isEmpty = computed(() => !this.loading() && this.inventories().length === 0);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventoriesService.getPublic(this.currentPage()).subscribe({
      next: (page) => {
        this.inventories.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load inventories');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadInventories();
  }
}
