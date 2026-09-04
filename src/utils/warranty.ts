export type WarrantyStatus =
  | "active"
  | "expiring"
  | "expired";

export function getWarrantyStatus(
  endDate: string
): WarrantyStatus {
  const today = new Date();
  const expiry = new Date(endDate);

  const millisecondsRemaining =
    expiry.getTime() - today.getTime();

  const daysRemaining =
    millisecondsRemaining / (1000 * 60 * 60 * 24);

  if (daysRemaining < 0) {
    return "expired";
  }

  if (daysRemaining <= 30) {
    return "expiring";
  }

  return "active";
}

export function getDaysRemaining(
  endDate: string
): number {
  const today = new Date();
  const expiry = new Date(endDate);

  const millisecondsRemaining =
    expiry.getTime() - today.getTime();

  return Math.ceil(
    millisecondsRemaining / (1000 * 60 * 60 * 24)
  );
}