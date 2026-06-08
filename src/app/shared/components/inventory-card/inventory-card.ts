import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Inventory } from '@shared/models';
import { getOptimizedImageUrl } from '@shared/utils/image.utils';
import { truncate } from '@shared/utils/string.utils';

@Component({
  selector: 'app-inventory-card',
  templateUrl: './inventory-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryCard {
  readonly inventory = input.required<Inventory>();
  readonly userName = input<string>('');
  readonly firstPhotoUrl = input<string | null>(null);
  readonly showActions = input(false);

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly toggleVisibility = output<string>();

  protected readonly imgUrl = getOptimizedImageUrl;

  readonly truncatedDescription = computed(() => truncate(this.inventory().description));
}
