import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import type { Item } from '@shared/models';
import { GeocodeService } from '@shared/services/geocode.service';

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
    effect(() => {
      const item = this.item();
      this.locationName.set('');
      if (item.coordX != null && item.coordY != null) {
        this.geocode.reverse(item.coordX, item.coordY).subscribe(result => {
          this.locationName.set(result.locationName);
        });
      }
    });
  }

  protected readonly imgUrl = (url: string | null | undefined): string =>
    url?.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url ?? '';

  readonly truncatedDescription = computed(() => {
    const desc = this.item().description;
    if (!desc) return '';
    return desc.length > 15 ? desc.substring(0, 15) + '...' : desc;
  });
}
