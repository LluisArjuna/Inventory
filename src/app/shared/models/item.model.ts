import type { Photo } from './photo.model';

export interface Item {
  id: string;
  name: string;
  description?: string;
  year: number;
  inventoryId: string;
  categoryId: string;
  coordinateId?: string;
  photos?: Photo[];
}

export interface ItemFilters {
  inventoryId?: string;
  categoryId?: string;
  name?: string;
  year?: number;
  page?: number;
  size?: number;
}
