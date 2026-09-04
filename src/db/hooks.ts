import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./database";

export function useProducts() {
  return useLiveQuery(
    () =>
      db.products
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    []
  );
}

export function useWarranties() {
  return useLiveQuery(
    () =>
      db.warranties
        .orderBy("endDate")
        .toArray(),
    []
  );
}

export function useProductWarranties(
  productId?: number
) {
  return useLiveQuery(
    () => {
      if (!productId) {
        return [];
      }

      return db.warranties
        .where("productId")
        .equals(productId)
        .toArray();
    },
    [productId]
  );
}