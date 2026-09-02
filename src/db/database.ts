import Dexie, { type Table } from "dexie";

export type Product = {
  id?: number;
  name: string;
  brand: string;
  model: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
};

class WarrantyDatabase extends Dexie {
  products!: Table<Product, number>;

  constructor() {
    super("WarrantyTrackerDatabase");

    this.version(1).stores({
      products: "++id, name, brand, model, purchaseDate, createdAt",
    });
  }
}

export const db = new WarrantyDatabase();