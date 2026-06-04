import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { ItemFilter } from '@features/items/item-filter/item-filter';
import { ItemCard } from '@shared/components/item-card/item-card';
import { Pagination } from '@shared/components/pagination/pagination';
import { BackButton } from '@shared/components/back-button/back-button';
import { LendingCalendar } from '@shared/components/lending-calendar/lending-calendar';
import type { Inventory, Item, Category, AvailabilityDateRange } from '@shared/models';

@Component({
  selector: 'app-inventory-detail',
  imports: [ItemCard, Pagination, ItemFilter, BackButton, RouterLink, LendingCalendar],
  templateUrl: './inventory-detail.html'
})
export class InventoryDetail implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly filters = signal<{ name?: string; categoryId?: string; year?: number }>({});
  readonly availabilities = signal<AvailabilityDateRange[]>([]);

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

    forkJoin({
      categories: this.categoriesService.getAll(),
      inventory: this.inventoriesService.getById(id),
      availabilities: this.inventoriesService.getAvailabilities(id)
    }).subscribe({
      next: ({ categories, inventory, availabilities }) => {
        this.categories.set(categories.content);
        this.inventory.set(inventory);
        this.availabilities.set(availabilities);
        this.loadItems();
      },
      error: () => {
        this.loading.set(false);
        this.error.set(
          this.auth.currentUser()
            ? 'Failed to load inventory'
            : 'Sign in to view this inventory'
        );
      }
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
