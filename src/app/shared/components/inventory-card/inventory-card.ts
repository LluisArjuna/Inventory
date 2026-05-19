import { Component, computed, input, output } from '@angular/core';
import type { Inventory } from '@shared/models';

@Component({
  selector: 'app-inventory-card',
  templateUrl: './inventory-card.html'
})
export class InventoryCard {
  readonly inventory = input.required<Inventory>();
  readonly userName = input<string>('');
  readonly firstPhotoUrl = input<string | null>(null);
  readonly showActions = input(false);

  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly toggleVisibility = output<string>();

  readonly truncatedDescription = computed(() => {
    const desc = this.inventory().description;
    if (!desc) return '';
    return desc.length > 15 ? desc.substring(0, 15) + '...' : desc;
  });
}
