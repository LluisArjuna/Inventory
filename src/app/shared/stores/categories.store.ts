import { Injectable, inject, signal, computed } from '@angular/core';
import { CategoriesService } from '@features/items/services/categories.service';
import type { Category } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly service = inject(CategoriesService);

  private readonly state = signal<Category[]>([]);
  readonly categories = this.state.asReadonly();

  readonly categoryMap = computed(() => {
    const m = new Map<string, string>();
    for (const c of this.state()) m.set(c.id, c.name);
    return m;
  });

  private loaded = false;

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.service.getAll().subscribe({
      next: page => this.state.set(page.content),
      error: () => { this.loaded = false; }
    });
  }
}
