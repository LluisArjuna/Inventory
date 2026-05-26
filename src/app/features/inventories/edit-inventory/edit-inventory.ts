import { Component, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import type { Inventory } from '@shared/models';

@Component({
  selector: 'app-edit-inventory',
  imports: [FormsModule],
  templateUrl: './edit-inventory.html'
})
export class EditInventory implements OnInit {
  private readonly service = inject(InventoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly inventory = signal<Inventory | null>(null);
  readonly name = signal('');
  readonly description = signal('');
  readonly isPublic = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/my-inventories']);
      return;
    }

    this.service.getById(id).subscribe({
      next: (inv) => {
        this.inventory.set(inv);
        this.name.set(inv.name);
        this.description.set(inv.description ?? '');
        this.isPublic.set(inv.isPublic);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load inventory');
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-inventories']);
  }

  save(): void {
    const inv = this.inventory();
    if (!inv || !this.name().trim()) return;

    this.saving.set(true);
    this.error.set('');

    this.service.update(inv.id, {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      isPublic: this.isPublic()
    }).subscribe({
      next: () => {
        this.router.navigate(['/my-inventories']);
      },
      error: () => {
        this.error.set('Failed to update inventory');
        this.saving.set(false);
      }
    });
  }
}
