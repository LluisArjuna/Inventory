import { Component, computed, input, output } from '@angular/core';
import type { Item } from '@shared/models';
import { getOptimizedImageUrl } from '@shared/utils/image.utils';
import { truncate } from '@shared/utils/string.utils';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.html'
})
export class ItemCard {
  readonly item = input.required<Item>();
  readonly categoryName = input<string>('');
  readonly locationName = input<string>('');
  readonly showActions = input(false);

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  protected readonly imgUrl = getOptimizedImageUrl;

  readonly truncatedDescription = computed(() => truncate(this.item().description));
}
