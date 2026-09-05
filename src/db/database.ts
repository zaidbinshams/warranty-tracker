import Dexie, { type Table } from "dexie";

export type Product = {
  id?: number;

  name: string;
  brand: string;
  model: string;

  purchaseDate: string;
  purchasePrice?: number;
  currency?: string;
  seller?: string;

  createdAt: string;
  updatedAt: string;
};

export type Warranty = {
  id?: number;

  productId: number;

  provider: string;

  type:
    | "manufacturer"
    | "seller"
    | "extended"
    | "other";

  startDate: string;
  durationMonths: number;
  endDate: string;

  coverage: string;
  exclusions: string;

  createdAt: string;
  updatedAt: string;
};

export type DocumentType =
  | "receipt"
  | "warranty"
  | "manual"
  | "service"
  | "other";

export type Document = {
  id?: number;

  productId: number;

  name: string;
  type: DocumentType;

  mimeType: string;
  size: number;

  file: Blob;

  createdAt: string;
};

class WarrantyDatabase extends Dexie {
  products!: Table<Product, number>;
  warranties!: Table<Warranty, number>;
  documents!: Table<Document, number>;

  constructor() {
    super("WarrantyTrackerDatabase");

    this.version(1).stores({
      products:
        "++id, name, brand, model, purchaseDate, createdAt",
    });

    this.version(2).stores({
      products:
        "++id, name, brand, model, purchaseDate, createdAt",

      warranties:
        "++id, productId, provider, type, startDate, endDate",
    });

    this.version(3).stores({
      products:
        "++id, name, brand, model, purchaseDate, createdAt",

      warranties:
        "++id, productId, provider, type, startDate, endDate",

      documents:
        "++id, productId, type, createdAt",
    });

    this.version(4).stores({
      products:
        "++id, name, brand, model, purchaseDate, createdAt",

      warranties:
        "++id, productId, provider, type, startDate, endDate",

      documents:
        "++id, productId, type, createdAt",
    });
  }
}

export const db = new WarrantyDatabase();