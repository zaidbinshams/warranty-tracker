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

export type Warranty = {
    id?: number;
    productId: number;

    provider: string;
    type: "manufacturer" | "seller" | "extended" | "other";

    startDate: string;
    durationMonths: number;
    endDate: string;

    coverage: string;
    exclusions: string;

    createdAt: string;
    updatedAt: string;
};

class WarrantyDatabase extends Dexie {
    products!: Table<Product, number>;
    warranties!: Table<Warranty, number>;

    constructor() {
        super("WarrantyTrackerDatabase");

        this.version(1).stores({
            products: "++id, name, brand, model, purchaseDate, createdAt",
        });

        this.version(3).stores({
            products: "++id, name, brand, model, purchaseDate, createdAt",
            warranties:
                "++id, productId, provider, type, startDate, endDate",
        });
    }
}

export const db = new WarrantyDatabase();