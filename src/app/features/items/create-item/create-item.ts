import { Component, computed, inject, input, output, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { concatMap, of } from 'rxjs';
import { CategoriesService } from '../services/categories.service';
import { CoordinatesService } from '../services/coordinates.service';
import { ItemsService } from '../services/items.service';
import { PhotoService } from '../services/photo.service';
import { Autocomplete } from '@shared/components/autocomplete/autocomplete';
import { Form, FormField, TextInput, TextArea } from '@shared/components/form';
import { Modal } from '@shared/components/modal/modal';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';
import type { Category } from '@shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-create-item',
  imports: [FormsModule, Autocomplete, Form, FormField, TextInput, TextArea, Modal],
  templateUrl: './create-item.html'
})
export class CreateItem implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly coordinatesService = inject(CoordinatesService);
  private readonly itemsService = inject(ItemsService);
  private readonly photoService = inject(PhotoService);
  private readonly mapService = inject(MapService);
  private readonly toast = inject(ToastService);

  readonly inventoryId = input.required<string>();
  readonly onClose = output<void>();
  readonly onCreated = output<void>();

  readonly name = signal('');
  readonly description = signal('');
  readonly year = signal<number | null>(null);
  readonly selectedCategory = signal<Category | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly creating = signal(false);

  readonly marker = signal<L.Marker | null>(null);
  readonly coordText = signal('');

  private map: L.Map | null = null;

  protected readonly categoryDisplay = (c: Category) => c.name;

  readonly canCreate = computed(() =>
    this.name().trim().length > 0 &&
    this.year() !== null &&
    this.year()! > 0 &&
    this.selectedCategory() !== null &&
    this.marker() !== null &&
    !this.creating()
  );

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe({
      next: (page) => this.categories.set(page.content),
      error: () => this.toast.error('Failed to load categories')
    });

    setTimeout(() => this.initMap(), 0);
  }

  private initMap(): void {
    if (this.map) return;

    this.map = this.mapService.createMap('map', [41.3874, 2.1686]);
    if (!this.map) return;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.mapService.removeMarker(this.marker());
      const newMarker = this.mapService.addMarker(this.map!, [lat, lng]);
      this.marker.set(newMarker);
      this.coordText.set(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  create(): void {
    if (!this.canCreate()) return;

    this.creating.set(true);

    const latLng = this.marker()!.getLatLng();

    this.coordinatesService.create(latLng.lat, latLng.lng).pipe(
      concatMap(coord => this.itemsService.create({
        name: this.name().trim(),
        description: this.description().trim() || undefined,
        year: this.year()!,
        inventoryId: this.inventoryId(),
        categoryId: this.selectedCategory()!.id,
        coordinateId: coord.id
      })),
      concatMap(item => {
        const file = this.selectedFile();
        return file
          ? this.photoService.upload(item.id, file, 0)
          : of(null);
      })
    ).subscribe({
      next: () => {
        this.creating.set(false);
        this.onCreated.emit();
        this.onClose.emit();
      },
      error: () => {
        this.creating.set(false);
      }
    });
  }
}
