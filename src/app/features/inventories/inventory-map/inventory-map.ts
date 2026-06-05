import { Component, inject, signal, type OnInit, type OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { MapService } from '@shared/services/map.service';
import { BackButton } from '@shared/components/back-button/back-button';
import { buildItemPopupHtml } from '@shared/utils/map-popup.utils';
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
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly mapService = inject(MapService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly loading = signal(true);
  readonly inventory = signal<Inventory | null>(null);
  readonly items = signal<Item[]>([]);
  readonly geocodedItems = signal<Item[]>([]);

  private map: L.Map | null = null;
  private markers: L.LayerGroup | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }

    this.categoriesStore.load();

    this.inventoriesService.getById(id).subscribe({
      next: (inventory) => {
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
    const catName = this.categoriesStore.categoryMap().get(item.categoryId) ?? '';
    const popupHtml = buildItemPopupHtml(item, catName);

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
