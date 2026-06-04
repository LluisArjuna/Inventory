import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Category } from '@shared/models';

@Component({
  selector: 'app-item-filter',
  imports: [FormsModule],
  templateUrl: './item-filter.html'
})
export class ItemFilter {
  readonly categories = input<Category[]>([]);

  readonly filterChange = output<{ name?: string; categoryId?: string; year?: number }>();

  readonly filterName = signal('');
  readonly filterCategoryId = signal('');
  readonly filterYear = signal<number | null>(null);

  private emitFilters(): void {
    this.filterChange.emit({
      name: this.filterName() || undefined,
      categoryId: this.filterCategoryId() || undefined,
      year: this.filterYear() ?? undefined
    });
  }

  onNameChange(value: string): void {
    this.filterName.set(value);
    this.emitFilters();
  }

  onCategoryChange(value: string): void {
    this.filterCategoryId.set(value);
    this.emitFilters();
  }

  onYearChange(value: string): void {
    this.filterYear.set(value ? Number(value) : null);
    this.emitFilters();
  }

  clearFilters(): void {
    this.filterName.set('');
    this.filterCategoryId.set('');
    this.filterYear.set(null);
    this.emitFilters();
  }
}
