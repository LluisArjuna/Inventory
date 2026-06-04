import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { BackButton } from '@shared/components/back-button/back-button';
import type { Inventory, Item, Category } from '@shared/models';
import type { ChartConfiguration, ChartData } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-inventory-stats',
  imports: [BaseChartDirective, BackButton],
  templateUrl: './inventory-stats.html'
})
export class InventoryStats implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly categoryChartData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  readonly yearChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  readonly summary = computed(() => {
    const all = this.items();
    const cats = this.categories();
    return {
      total: all.length,
      withPhotos: all.filter(i => i.photos && i.photos.length > 0).length,
      withCoords: all.filter(i => i.coordX != null && i.coordY != null).length,
      categories: new Set(all.map(i => i.categoryId)).size
    };
  });

  protected readonly categoryColors = [
    '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
    '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'
  ];

  protected readonly categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = ctx.parsed as number;
            const pct = ((value / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${value} items (${pct}%)`;
          }
        }
      }
    }
  };

  protected readonly yearChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y} items`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }

    forkJoin({
      catPage: this.categoriesService.getAll(),
      inventory: this.inventoriesService.getById(id)
    }).subscribe({
      next: ({ catPage, inventory }) => {
        this.categories.set(catPage.content);
        this.inventory.set(inventory);
        this.loadItems(inventory.id);
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private loadItems(inventoryId: string): void {
    this.itemsService.getAll(0, 200, { inventoryId }).subscribe({
      next: (page) => {
        this.items.set(page.content);
        this.buildCharts(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildCharts(items: Item[]): void {
    this.buildCategoryChart(items);
    this.buildYearChart(items);
  }

  private buildCategoryChart(items: Item[]): void {
    const catMap = new Map<string, string>();
    for (const c of this.categories()) catMap.set(c.id, c.name);

    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    this.categoryChartData.set({
      labels: sorted.map(([id]) => catMap.get(id) ?? id),
      datasets: [{
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map((_, i) => this.categoryColors[i % this.categoryColors.length]),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    });
  }

  private buildYearChart(items: Item[]): void {
    const counts = new Map<number, number>();
    for (const item of items) {
      counts.set(item.year, (counts.get(item.year) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);

    this.yearChartData.set({
      labels: sorted.map(([year]) => String(year)),
      datasets: [{
        data: sorted.map(([, count]) => count),
        backgroundColor: '#3b82f6',
        borderWidth: 0,
        borderRadius: 4
      }]
    });
  }
}
