import { Component, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { CreateItem } from '@features/items/create-item/create-item';
import type { Inventory, Item, Category } from '@shared/models';

@Component({
  selector: 'app-edit-inventory',
  imports: [FormsModule, CreateItem],
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
  readonly categoryMap = signal<Record<string, string>>({});
  readonly showCreateDialog = signal(false);

  protected readonly imgUrl = (url: string | null | undefined): string =>
    url?.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url ?? '';

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
  }

  private loadItems(): void {
    this.itemsLoading.set(true);
    this.itemsService.getAll({ inventoryId: this.inventoryId }).subscribe({
      next: (page) => {
        this.items.set(page.content);
        this.itemsLoading.set(false);
      },
      error: () => {
        this.itemsLoading.set(false);
      }
    });
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
        this.router.navigate(['/my-inventories']);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
