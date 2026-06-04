import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import type { Item } from '@shared/models';
import { GeocodeService } from '@shared/services/geocode.service';
import { getOptimizedImageUrl } from '@shared/utils/image.utils';
import { truncate } from '@shared/utils/string.utils';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.html'
})
export class ItemCard {
  private readonly geocode = inject(GeocodeService);

  readonly item = input.required<Item>();
  readonly categoryName = input<string>('');
  readonly showActions = input(false);

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly delete = output<string>();

  protected readonly locationName = signal('');

  constructor() {
    effect((onCleanup) => {
      const item = this.item();
      this.locationName.set('');
      if (item.coordX != null && item.coordY != null) {
        const sub = this.geocode.reverse(item.coordX, item.coordY).subscribe(result => {
          this.locationName.set(result.locationName);
        });
        onCleanup(() => sub.unsubscribe());
      }
    });
  }

  protected readonly imgUrl = getOptimizedImageUrl;

  readonly truncatedDescription = computed(() => truncate(this.item().description));
}
