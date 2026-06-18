import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Item } from '@shared/models';
import { getOptimizedImageUrl } from '@shared/utils/image.utils';
import { truncate } from '@shared/utils/string.utils';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemCard {
  readonly item = input.required<Item>();
  readonly categoryName = input<string>('');
  readonly locationName = input<string>('');
  readonly showActions = input(false);

  readonly onView = output<string>();
  readonly onEdit = output<string>();
  readonly onDelete = output<string>();

  protected readonly imgUrl = getOptimizedImageUrl;

  readonly truncatedDescription = computed(() => truncate(this.item().description));
}
