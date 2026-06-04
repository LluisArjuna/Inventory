export interface Inventory {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  firstPhotoUrl?: string;
}
export interface CreateInventoryRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  firebaseUid: string;
}

export interface InventoryFilters {
  categoryId?: string;
  name?: string;
  isPublic?: boolean;
  page?: number;
  size?: number;
}
