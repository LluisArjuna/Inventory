import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { Form, TextInput, TextArea, Checkbox } from '@shared/components/form';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-create-inventory',
  imports: [Form, TextInput, TextArea, Checkbox],
  templateUrl: './create-inventory.html'
})
export class CreateInventory {
  private readonly service = inject(InventoriesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly onClose = output<void>();

  readonly name = signal('');
  readonly description = signal('');
  readonly isPublic = signal(false);
  readonly creating = signal(false);

  create(): void {
    const firebaseUid = this.auth.currentUser()?.id;
    if (!firebaseUid || !this.name().trim()) return;

    this.creating.set(true);

    this.service.create({
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      isPublic: this.isPublic(),
      firebaseUid
    }).subscribe({
      next: (inventory) => {
        this.router.navigate(['/inventories', inventory.id, 'edit']);
        this.onClose.emit();
      },
      error: () => {
        this.creating.set(false);
        this.toast.error('Failed to create inventory');
      }
    });
  }
}
