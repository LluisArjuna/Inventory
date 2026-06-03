import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from '../services/items.service';
import { CategoriesService } from '../services/categories.service';
import { GeocodeService } from '@shared/services/geocode.service';
import type { Item, Category } from '@shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.html'
})
export class ItemDetail implements OnInit {
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly geocode = inject(GeocodeService);
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
          }
        });

        if (item.coordX != null && item.coordY != null) {
          this.geocode.reverse(item.coordX, item.coordY).subscribe(result => {
            this.locationName.set(result.locationName);
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

    const el = document.getElementById('item-detail-map');
    if (!el) return;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(el, { center: [lat, lng], zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => this.map!.invalidateSize(), 100);

    this.marker = L.marker([lat, lng]).addTo(this.map);
  }

  protected readonly imgUrl = (url: string | null | undefined): string =>
    url?.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url ?? '';
}
