import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { ItemFilter } from '@features/items/item-filter/item-filter';
import { ItemCard } from '@shared/components/item-card/item-card';
import { Pagination } from '@shared/components/pagination/pagination';
import type { Inventory, Item, Category } from '@shared/models';

@Component({
  selector: 'app-inventory-detail',
  imports: [ItemCard, Pagination, ItemFilter],
  templateUrl: './inventory-detail.html'
})
export class InventoryDetail implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly filters = signal<{ name?: string; categoryId?: string; year?: number }>({});

  readonly categoryMap = computed(() => {
    const map = new Map<string, string>();
    for (const c of this.categories()) {
      map.set(c.id, c.name);
    }
    return map;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.categoriesService.getAll().subscribe({
      next: (catPage) => {
        this.categories.set(catPage.content);
        this.inventoriesService.getById(id).subscribe({
          next: (inv) => {
            this.inventory.set(inv);
            this.loadItems();
          },
          error: () => this.router.navigate(['/'])
        });
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private loadItems(): void {
    const inv = this.inventory();
    if (!inv) return;

    this.itemsService.getAll(this.currentPage(), 20, { inventoryId: inv.id, ...this.filters() }).subscribe({
      next: (page) => {
        this.items.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(f: { name?: string; categoryId?: string; year?: number }): void {
    this.filters.set(f);
    this.currentPage.set(0);
    this.loadItems();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadItems();
  }

  goToItemDetail(itemId: string): void {
    this.router.navigate(['/items', itemId]);
  }
}
