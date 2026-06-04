import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from '../services/items.service';
import { CategoriesService } from '../services/categories.service';
import { GeocodeService } from '@shared/services/geocode.service';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';
import { BackButton } from '@shared/components/back-button/back-button';
import type { Item, Category } from '@shared/models';
import { getOptimizedImageUrl } from '@shared/utils/image.utils';
import * as L from 'leaflet';

@Component({
  selector: 'app-item-detail',
  imports: [BackButton],
  templateUrl: './item-detail.html'
})
export class ItemDetail implements OnInit {
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly geocode = inject(GeocodeService);
  private readonly mapService = inject(MapService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly item = signal<Item | null>(null);
  readonly categoryName = signal('');
  readonly locationName = signal('');

  readonly selectedPhoto = signal<string | null>(null);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.itemsService.getById(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.selectedPhoto.set(item.photos?.[0]?.url ?? null);

        this.categoriesService.getAll().subscribe({
          next: (page) => {
            const cat = page.content.find(c => c.id === item.categoryId);
            if (cat) this.categoryName.set(cat.name);
          },
          error: () => this.toast.error('Failed to load categories')
        });

        if (item.coordX != null && item.coordY != null) {
          this.geocode.reverse(item.coordX, item.coordY).subscribe({
            next: result => this.locationName.set(result.locationName),
            error: () => this.locationName.set('Location unavailable')
          });
        }

        this.loading.set(false);

        const x = item.coordX;
        const y = item.coordY;
        if (x != null && y != null) {
          setTimeout(() => this.initMap(x, y), 0);
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private initMap(lat: number, lng: number): void {
    if (this.map) return;

    this.map = this.mapService.createMap('item-detail-map', [lat, lng]);
    if (!this.map) return;

    this.marker = this.mapService.addMarker(this.map, [lat, lng]);
  }

  protected readonly imgUrl = getOptimizedImageUrl;
}
