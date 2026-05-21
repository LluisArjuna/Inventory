import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  templateUrl: './skeleton-card.html'
})
export class SkeletonCard {
  readonly count = input(6);
  readonly items = computed(() => Array.from({ length: this.count() }));
}
