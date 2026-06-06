import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import type { Category } from '@shared/models';

@Component({
  selector: 'app-item-filter',
  imports: [FormsModule],
  templateUrl: './item-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFilter {
  private readonly destroyRef = inject(DestroyRef);
  private readonly nameChange = new Subject<string>();

  readonly categories = input<Category[]>([]);

  readonly filterChange = output<{ name?: string; categoryId?: string; year?: number }>();

  readonly filterName = signal('');
  readonly filterCategoryId = signal('');
  readonly filterYear = signal<number | null>(null);

  constructor() {
    this.nameChange.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(name => {
      this.filterName.set(name);
      this.emitFilters();
    });
  }

  private emitFilters(): void {
    this.filterChange.emit({
      name: this.filterName() || undefined,
      categoryId: this.filterCategoryId() || undefined,
      year: this.filterYear() ?? undefined
    });
  }

  onNameChange(value: string): void {
    this.nameChange.next(value);
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
    this.nameChange.next('');
    this.filterCategoryId.set('');
    this.filterYear.set(null);
    this.emitFilters();
  }
}
