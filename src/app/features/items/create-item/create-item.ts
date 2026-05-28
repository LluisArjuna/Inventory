import { Component, inject, input, output, signal, effect, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../services/categories.service';
import { CoordinatesService } from '../services/coordinates.service';
import { ItemsService } from '../services/items.service';
import { PhotoService } from '../services/photo.service';
import { Autocomplete } from '@shared/components/autocomplete/autocomplete';
import { Form, FormField, TextInput, TextArea } from '@shared/components/form';
import { Modal } from '@shared/components/modal/modal';
import type { Category } from '@shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-create-item',
  imports: [FormsModule, Autocomplete, Form, FormField, TextInput, TextArea, Modal],
  templateUrl: './create-item.html'
})
export class CreateItem {
  private readonly categoriesService = inject(CategoriesService);
  private readonly coordinatesService = inject(CoordinatesService);
  private readonly itemsService = inject(ItemsService);
  private readonly photoService = inject(PhotoService);

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

  constructor() {
    afterNextRender(() => this.initMap());

    effect(() => {
      if (this.inventoryId()) {
        this.categoriesService.getAll().subscribe({
          next: (page) => this.categories.set(page.content)
        });
      }
    });
  }

  private initMap(): void {
    const el = document.getElementById('map');
    if (!el || this.map) return;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(el, { center: [41.3874, 2.1686], zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => this.map!.invalidateSize(), 100);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker()?.remove();
      const newMarker = L.marker([lat, lng]).addTo(this.map!);
      this.marker.set(newMarker);
      this.coordText.set(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  get canCreate(): boolean {
    return (
      this.name().trim().length > 0 &&
      this.year() !== null &&
      this.year()! > 0 &&
      this.selectedCategory() !== null &&
      this.marker() !== null &&
      !this.creating()
    );
  }

  create(): void {
    if (!this.canCreate) return;

    this.creating.set(true);

    const latLng = this.marker()!.getLatLng();

    this.coordinatesService.create(latLng.lat, latLng.lng).subscribe({
      next: (coord) => {
        this.itemsService.create({
          name: this.name().trim(),
          description: this.description().trim() || undefined,
          year: this.year()!,
          inventoryId: this.inventoryId(),
          categoryId: this.selectedCategory()!.id,
          coordinateId: coord.id
        }).subscribe({
          next: (item) => this.uploadPhoto(item.id),
          error: () => {
            this.creating.set(false);
          }
        });
      },
      error: () => {
        this.creating.set(false);
      }
    });
  }

  private uploadPhoto(itemId: string): void {
    const file = this.selectedFile();
    if (!file) {
      this.creating.set(false);
      this.onCreated.emit();
      this.onClose.emit();
      return;
    }

    this.photoService.upload(itemId, file, 0).subscribe({
      next: () => {
        this.creating.set(false);
        this.onCreated.emit();
        this.onClose.emit();
      },
      error: () => {
        this.creating.set(false);
        this.onCreated.emit();
        this.onClose.emit();
      }
    });
  }
}
