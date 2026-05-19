export interface Inventory {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
}

export interface InventoryFilters {
  categoryId?: string;
  name?: string;
  isPublic?: boolean;
  page?: number;
  size?: number;
}
