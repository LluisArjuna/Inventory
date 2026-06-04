import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { CreateItem } from '@features/items/create-item/create-item';
import { ItemFilter } from '@features/items/item-filter/item-filter';
import { Form, TextInput, TextArea, Checkbox } from '@shared/components/form';
import { ItemCard } from '@shared/components/item-card/item-card';
import { Modal } from '@shared/components/modal/modal';
import { LendingCalendar } from '@shared/components/lending-calendar/lending-calendar';
import type { Inventory, Item, Category, AvailabilityDateRange } from '@shared/models';

@Component({
  selector: 'app-edit-inventory',
  imports: [CreateItem, ItemFilter, Form, TextInput, TextArea, Checkbox, ItemCard, Modal, LendingCalendar],
  templateUrl: './edit-inventory.html'
})
export class EditInventory implements OnInit {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly inventory = signal<Inventory | null>(null);
  readonly name = signal('');
  readonly description = signal('');
  readonly isPublic = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly items = signal<Item[]>([]);
  readonly itemsLoading = signal(false);
  readonly deleting = signal<Set<string>>(new Set());
  readonly categories = signal<Category[]>([]);
  readonly categoryMap = signal<Record<string, string>>({});
  readonly showCreateDialog = signal(false);
  readonly filters = signal<{ name?: string; categoryId?: string; year?: number }>({});
  readonly showDeleteConfirm = signal(false);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly availabilities = signal<AvailabilityDateRange[]>([]);
  readonly savingAvailability = signal(false);

  inventoryId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/my-inventories']);
      return;
    }

    this.inventoryId = id;

    this.categoriesService.getAll().subscribe({
      next: (page) => {
        this.categories.set(page.content);
        const map: Record<string, string> = {};
        page.content.forEach((c: Category) => { map[c.id] = c.name; });
        this.categoryMap.set(map);
      }
    });

    this.inventoriesService.getById(id).subscribe({
      next: (inv) => {
        this.inventory.set(inv);
        this.name.set(inv.name);
        this.description.set(inv.description ?? '');
        this.isPublic.set(inv.isPublic);
        this.loading.set(false);
        this.loadItems();
      },
      error: () => {
        this.loading.set(false);
      }
    });

    this.inventoriesService.getAvailabilities(id).subscribe({
      next: (avail) => this.availabilities.set(avail)
    });
  }

  private loadItems(): void {
    this.itemsLoading.set(true);
    this.itemsService.getAll(0, 20, { inventoryId: this.inventoryId, ...this.filters() }).subscribe({
      next: (page) => {
        this.items.set(page.content);
        this.itemsLoading.set(false);
      },
      error: () => {
        this.itemsLoading.set(false);
      }
    });
  }

  onEditItem(id: string): void {
    this.router.navigate(['/items', id, 'edit']);
  }

  deleteItem(id: string): void {
    this.pendingDeleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;

    this.showDeleteConfirm.set(false);
    this.pendingDeleteId.set(null);

    this.deleting.update(s => new Set(s).add(id));

    this.itemsService.delete(id).subscribe({
      next: () => {
        this.deleting.update(s => { s.delete(id); return new Set(s); });
        this.items.update(list => list.filter(i => i.id !== id));
      },
      error: () => {
        this.deleting.update(s => { s.delete(id); return new Set(s); });
      }
    });
  }

  onFilterChange(f: { name?: string; categoryId?: string; year?: number }): void {
    this.filters.set(f);
    this.loadItems();
  }

  onItemCreated(): void {
    this.showCreateDialog.set(false);
    this.loadItems();
  }

  cancel(): void {
    this.router.navigate(['/my-inventories']);
  }

  save(): void {
    const inv = this.inventory();
    if (!inv || !this.name().trim()) return;

    this.saving.set(true);

    this.inventoriesService.update(inv.id, {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      isPublic: this.isPublic()
    }).subscribe({
      next: () => {
        this.saveAvailabilities(inv.id);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  private saveAvailabilities(inventoryId: string): void {
    this.savingAvailability.set(true);

    this.inventoriesService.setAvailabilities(inventoryId, this.availabilities()).subscribe({
      next: () => {
        this.router.navigate(['/my-inventories']);
      },
      error: () => {
        this.saving.set(false);
        this.savingAvailability.set(false);
      }
    });
  }

  onAvailabilitiesChange(ranges: AvailabilityDateRange[]): void {
    this.availabilities.set(ranges);
  }
}
