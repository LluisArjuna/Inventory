import { Component, inject, signal, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesService } from '@features/items/services/categories.service';
import { MapService } from '@shared/services/map.service';
import { BackButton } from '@shared/components/back-button/back-button';
import type { Inventory, Item } from '@shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-inventory-map',
  imports: [BackButton],
  templateUrl: './inventory-map.html'
})
export class InventoryMap implements OnInit, OnDestroy {
  private readonly inventoriesService = inject(InventoriesService);
  private readonly itemsService = inject(ItemsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly mapService = inject(MapService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);
  readonly geocodedItems = signal<Item[]>([]);
  readonly categoryMap = signal<Map<string, string>>(new Map());

  private map: L.Map | null = null;
  private markers: L.LayerGroup | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }

    forkJoin({
      catPage: this.categoriesService.getAll(),
      inventory: this.inventoriesService.getById(id)
    }).subscribe({
      next: ({ catPage, inventory }) => {
        const map = new Map<string, string>();
        for (const c of catPage.content) map.set(c.id, c.name);
        this.categoryMap.set(map);
        this.inventory.set(inventory);
        this.loadItems(inventory.id);
      },
      error: () => this.router.navigate(['/'])
    });
  }

  private loadItems(inventoryId: string): void {
    this.itemsService.getAll(0, 200, { inventoryId }).subscribe({
      next: (page) => {
        const all = page.content;
        this.items.set(all);
        this.geocodedItems.set(all.filter(it => it.coordX != null && it.coordY != null));
        this.loading.set(false);
        setTimeout(() => this.initMap(), 0);
      },
      error: () => this.loading.set(false)
    });
  }

  private initMap(): void {
    if (this.map) return;

    const items = this.geocodedItems();
    if (items.length === 0) return;

    const center: L.LatLngExpression = [items[0].coordX!, items[0].coordY!];
    this.map = this.mapService.createMap('inventory-map', center);
    if (!this.map) return;

    const markers = items.map(item => this.createMarker(item));
    this.markers = L.layerGroup(markers).addTo(this.map);

    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  private createMarker(item: Item): L.Marker {
    const catName = this.categoryMap().get(item.categoryId) ?? '';
    const photoUrl = item.photos?.[0]?.url;

    const popupHtml = `
      <div class="item-link" data-item-id="${item.id}">
        ${photoUrl ? `<img src="${photoUrl}" alt="${item.name}" style="width:100%;height:110px;object-fit:cover;display:block" />` : ''}
        <div style="padding:14px 16px 12px">
          <strong style="font-size:15px">${item.name}</strong>
          <div style="font-size:12px;color:#666;margin-top:4px">
            ${item.year}
            ${catName ? `<span style="margin-left:6px">· ${catName}</span>` : ''}
          </div>
          <div style="margin-top:12px">
            <span style="display:block;text-align:center;padding:7px 0;font-size:12px;font-weight:500;color:#2563eb;background:#eff6ff;border-radius:6px">View details</span>
          </div>
        </div>
      </div>
    `;

    const marker = L.marker([item.coordX!, item.coordY!]);
    marker.bindPopup(popupHtml, { closeButton: false, className: 'inventory-map-popup', maxWidth: 220, minWidth: 200 });

    marker.on('popupopen', () => {
      const popupEl = marker.getPopup()?.getElement();
      const link = popupEl?.querySelector('.item-link');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.router.navigate(['/items', item.id]);
        }, { once: true });
      }
    });

    return marker;
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap(this.map);
    this.map = null;
  }
}
