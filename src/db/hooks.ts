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
        .sortBy("endDate");
    },
    [productId]
  );
}

export function useDocuments() {
  return useLiveQuery(
    () =>
      db.documents
        .orderBy("createdAt")
        .reverse()
        .toArray(),
    []
  );
}

export function useProductDocuments(
  productId?: number
) {
  return useLiveQuery(
    () => {
      if (!productId) {
        return [];
      }

      return db.documents
        .where("productId")
        .equals(productId)
        .reverse()
        .sortBy("createdAt");
    },
    [productId]
  );
}