import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { InventoryCard } from '@shared/components/inventory-card/inventory-card';
import { SkeletonCard } from '@shared/components/skeleton-card/skeleton-card';
import { Pagination } from '@shared/components/pagination/pagination';
import type { Inventory } from '@shared/models';

@Component({
  selector: 'app-public-inventories',
  imports: [InventoryCard, SkeletonCard, Pagination],
  templateUrl: './public-inventories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicInventories implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly inventories = signal<Inventory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);
  readonly searchQuery = signal('');

  readonly isEmpty = computed(() => !this.loading() && this.inventories().length === 0);

  ngOnInit(): void {
    this.searchQuery.set(this.route.snapshot.queryParamMap.get('search') ?? '');
    this.loadInventories();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const query = (params['search'] as string) ?? '';
      if (query !== this.searchQuery()) {
        this.searchQuery.set(query);
        this.currentPage.set(0);
        this.loadInventories();
      }
    });
  }

  loadInventories(): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: Record<string, string | number | boolean | undefined> = {};
    const query = this.searchQuery();
    if (query) {
      filters['name'] = query;
    }

    this.inventoriesService.getPublic(this.currentPage(), 20, filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
