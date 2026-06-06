import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { BackButton } from '@shared/components/back-button/back-button';
import { buildCategoryChartData, buildYearChartData, categoryChartOptions, yearChartOptions } from '@shared/utils/chart.utils';
import type { Inventory, Item } from '@shared/models';
import type { ChartData } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-inventory-stats',
  imports: [BaseChartDirective, BackButton],
  templateUrl: './inventory-stats.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryStats implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);

  readonly categoryChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  readonly yearChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  protected readonly categoryChartOptions = categoryChartOptions;
  protected readonly yearChartOptions = yearChartOptions;

  readonly summary = computed(() => {
    const all = this.items();
    return {
      total: all.length,
      withPhotos: all.filter(i => i.photos && i.photos.length > 0).length,
      withCoords: all.filter(i => i.coordX != null && i.coordY != null).length,
      categories: new Set(all.map(i => i.categoryId)).size
    };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }

    this.categoriesStore.load();

    this.inventoriesService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (inventory) => {
        this.inventory.set(inventory);
        this.loadItems(inventory.id);
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private loadItems(inventoryId: string): void {
    this.itemsService.getAll(0, 200, { inventoryId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.items.set(page.content);
          this.buildCharts(page.content);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private buildCharts(items: Item[]): void {
    const catMap = this.categoriesStore.categoryMap();
    this.categoryChartData.set(buildCategoryChartData(items, catMap));
    this.yearChartData.set(buildYearChartData(items));
  }
}
