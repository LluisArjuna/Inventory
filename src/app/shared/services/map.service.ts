import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {

  createMap(elementId: string, center: L.LatLngExpression, zoom = 13): L.Map | null {
    const el = document.getElementById(elementId);
    if (!el) return null;

    L.Icon.Default.imagePath = '';
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(el, { center, zoom });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 100);

    return map;
  }

  addMarker(map: L.Map, latlng: L.LatLngExpression): L.Marker {
    const marker = L.marker(latlng).addTo(map);
    return marker;
  }

  removeMarker(marker: L.Marker | null): void {
    marker?.remove();
  }

  destroyMap(map: L.Map | null): void {
    map?.remove();
  }
}
