export type WarrantyStatus =
  | "active"
  | "expiring"
  | "expired";

function getTodayString(): string {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateToUtcDay(
  dateString: string
): number {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return Date.UTC(
    year,
    month - 1,
    day
  );
}

export function getDaysRemaining(
  endDate: string
): number {
  if (!endDate) {
    return 0;
  }

  const today =
    dateToUtcDay(
      getTodayString()
    );

  const expiry =
    dateToUtcDay(endDate);

  return Math.ceil(
    (expiry - today) /
      (1000 * 60 * 60 * 24)
  );
}

export function getWarrantyStatus(
  endDate: string
): WarrantyStatus {
  const daysRemaining =
    getDaysRemaining(endDate);

  if (daysRemaining < 0) {
    return "expired";
  }

  if (daysRemaining <= 30) {
    return "expiring";
  }

  return "active";
}