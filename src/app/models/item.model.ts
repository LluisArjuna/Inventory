export interface Item {
  id: string;
  name: string;
  description?: string;
  year: number;
  inventoryId: string;
  categoryId: string;
  coordinateId?: string;
}
