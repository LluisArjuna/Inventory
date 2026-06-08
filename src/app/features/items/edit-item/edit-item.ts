import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ItemsService } from '../services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { CoordinatesService } from '../services/coordinates.service';
import { PhotoService } from '../services/photo.service';
import { GeocodeService } from '@shared/services/geocode.service';
import { Autocomplete } from '@shared/components/autocomplete/autocomplete';
import { Form, FormField, TextInput, TextArea } from '@shared/components/form';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';
import type { Item, Category, Photo } from '@shared/models';
import * as L from 'leaflet';

@Component({
  selector: 'app-edit-item',
  imports: [FormsModule, Autocomplete, Form, FormField, TextInput, TextArea],
  templateUrl: './edit-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditItem implements OnInit {
  private readonly itemsService = inject(ItemsService);
  protected readonly categoriesStore = inject(CategoriesStore);
  private readonly coordinatesService = inject(CoordinatesService);
  private readonly photoService = inject(PhotoService);
  private readonly geocode = inject(GeocodeService);
  private readonly mapService = inject(MapService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly name = signal('');
  readonly description = signal('');
  readonly year = signal<number | null>(null);
  readonly selectedCategory = signal<Category | null>(null);
  readonly selectedFile = signal<File | null>(null);

  readonly photos = signal<Photo[]>([]);
  readonly deletingPhotos = signal<Set<string>>(new Set());

  readonly marker = signal<L.Marker | null>(null);
  readonly coordText = signal('');
  readonly coordLocation = signal('');

  private itemId = '';
  private inventoryId = '';
  private originalCoordId: string | null = null;
  private originalLat = 0;
  private originalLng = 0;
  private coordChanged = false;
  private map: L.Map | null = null;

  protected readonly categoryDisplay = (c: Category) => c.name;

  readonly canSave = computed(() =>
    this.name().trim().length > 0 &&
    this.year() !== null &&
    this.year()! > 0 &&
    this.selectedCategory() !== null &&
    !this.saving()
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/my-inventories']);
      return;
    }

    this.itemId = id;
    this.categoriesStore.load();

    this.itemsService.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (item) => this.populateForm(item),
      error: () => this.router.navigate(['/my-inventories'])
    });
  }

  private populateForm(item: Item): void {
    this.name.set(item.name);
    this.description.set(item.description ?? '');
    this.year.set(item.year);
    this.photos.set(item.photos ?? []);
    this.inventoryId = item.inventoryId;

    if (item.coordinateId) {
      this.originalCoordId = item.coordinateId;
    }
    if (item.coordX != null && item.coordY != null) {
      this.originalLat = item.coordX;
      this.originalLng = item.coordY;
    }

    this.loading.set(false);

    const cat = this.categoriesStore.categories().find(c => c.id === item.categoryId);
    if (cat) this.selectedCategory.set(cat);

    setTimeout(() => {
      this.initMap();
      if (this.originalLat !== 0 || this.originalLng !== 0) {
        this.placeMarker(this.originalLat, this.originalLng);
      }
    }, 0);
  }

  private initMap(): void {
    if (this.map) return;

    this.map = this.mapService.createMap('edit-item-map', [41.3874, 2.1686]);
    if (!this.map) return;

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.mapService.removeMarker(this.marker());
      const newMarker = this.mapService.addMarker(this.map!, [lat, lng]);
      this.marker.set(newMarker);
      this.coordText.set(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      this.coordLocation.set('');
      this.geocode.reverse(lat, lng)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: result => this.coordLocation.set(result.locationName),
          error: () => this.coordLocation.set('Location unavailable')
        });
      this.coordChanged = true;
    });
  }

  private placeMarker(lat: number, lng: number): void {
    if (!this.map) return;
    this.mapService.removeMarker(this.marker());
    const newMarker = this.mapService.addMarker(this.map!, [lat, lng]);
    this.marker.set(newMarker);
    this.coordText.set(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    this.coordLocation.set('');
    this.geocode.reverse(lat, lng)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => this.coordLocation.set(result.locationName),
        error: () => this.coordLocation.set('Location unavailable')
      });
    this.map.setView([lat, lng], 13);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  deletePhoto(photoId: string): void {
    this.deletingPhotos.update(s => new Set(s).add(photoId));

    this.photoService.deletePhoto(this.itemId, photoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingPhotos.update(s => { s.delete(photoId); return new Set(s); });
          this.photos.update(list => list.filter(p => p.id !== photoId));
        },
        error: () => {
          this.deletingPhotos.update(s => { s.delete(photoId); return new Set(s); });
        }
      });
  }

  save(): void {
    if (!this.canSave()) return;

    this.saving.set(true);

    const latLng = this.marker()?.getLatLng();
    const coordId$ = this.coordChanged && latLng
      ? this.coordinatesService.create(latLng.lat, latLng.lng).pipe(map(c => c.id))
      : of(this.originalCoordId ?? undefined);

    coordId$.pipe(
      switchMap(coordinateId =>
        this.itemsService.update(this.itemId, {
          name: this.name().trim(),
          description: this.description().trim() || undefined,
          year: this.year()!,
          categoryId: this.selectedCategory()!.id,
          coordinateId
        })
      ),
      switchMap(() => {
        const file = this.selectedFile();
        return file
          ? this.photoService.upload(this.itemId, file, this.photos().length)
          : of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/inventories', this.inventoryId, 'edit']);
      },
      error: () => this.saving.set(false)
    });
  }

  cancel(): void {
    this.router.navigate(['/inventories', this.inventoryId, 'edit']);
  }
}
