import { ChangeDetectionStrategy, Component, effect, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  imports: [FormsModule],
  templateUrl: './autocomplete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autocomplete<T extends { id: string }> {
  readonly items = input.required<T[]>();
  readonly displayFn = input.required<(item: T) => string>();
  readonly placeholder = input('Search...');

  readonly value = input<T | null>(null);

  readonly selectionChange = output<T>();

  readonly query = signal('');
  readonly selected = signal<T | null>(null);
  readonly highlightedIndex = signal(-1);
  readonly showDropdown = signal(false);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return q ? this.items().filter(i => this.displayFn()(i).toLowerCase().includes(q)) : [];
  });

  readonly activeDescendantId = computed(() => {
    const idx = this.highlightedIndex();
    return idx >= 0 ? `autocomplete-option-${idx}` : undefined;
  });

  constructor() {
    effect(() => {
      const v = this.value();
      if (v !== null) {
        this.query.set(this.displayFn()(v));
        this.selected.set(v);
      }
    });
  }

  select(item: T): void {
    this.selected.set(item);
    this.query.set(this.displayFn()(item));
    this.showDropdown.set(false);
    this.selectionChange.emit(item);
  }

  onInput(): void {
    if (!this.selected() || this.query() !== this.displayFn()(this.selected()!)) {
      this.selected.set(null);
    }
    this.showDropdown.set(true);
    this.highlightedIndex.set(-1);
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.filtered();
    if (!this.showDropdown() || list.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
    } else if (event.key === 'Enter' && this.highlightedIndex() >= 0) {
      event.preventDefault();
      this.select(list[this.highlightedIndex()]);
    } else if (event.key === 'Escape') {
      this.showDropdown.set(false);
    }
  }
}
