import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./database";

export function useProducts() {
  return useLiveQuery(
    () => db.products.orderBy("createdAt").reverse().toArray(),
    []
  );
}