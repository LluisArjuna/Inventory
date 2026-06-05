import { Component, inject, signal, computed, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { InventoryCard } from '@shared/components/inventory-card/inventory-card';
import { SkeletonCard } from '@shared/components/skeleton-card/skeleton-card';
import { Pagination } from '@shared/components/pagination/pagination';
import type { Inventory } from '@shared/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-inventories',
  imports: [InventoryCard, SkeletonCard, Pagination],
  templateUrl: './public-inventories.html'
})
export class PublicInventories implements OnInit, OnDestroy {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly inventories = signal<Inventory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);
  readonly searchQuery = signal('');

  private querySub?: Subscription;

  readonly isEmpty = computed(() => !this.loading() && this.inventories().length === 0);

  ngOnInit(): void {
    this.searchQuery.set(this.route.snapshot.queryParamMap.get('search') ?? '');
    this.loadInventories();

    this.querySub = this.route.queryParams.subscribe(params => {
      const query = (params['search'] as string) ?? '';
      if (query !== this.searchQuery()) {
        this.searchQuery.set(query);
        this.currentPage.set(0);
        this.loadInventories();
      }
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  loadInventories(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: Record<string, string | number | boolean | undefined> = {};
    const query = this.searchQuery();
    if (query) {
      filters['name'] = query;
    }

    this.inventoriesService.getPublic(this.currentPage(), 20, filters).subscribe({
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

  goToInventory(id: string): void {
    this.router.navigate(['/inventories', id]);
  }

}
