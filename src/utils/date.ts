function getDaysInMonth(
  year: number,
  month: number
): number {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

export function addMonths(
  dateString: string,
  months: number
): string {
  if (!dateString) {
    return "";
  }

  if (
    !Number.isInteger(months) ||
    months < 0
  ) {
    return "";
  }

  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return "";
  }

  /*
   * Work entirely with calendar components
   * rather than relying on Date.setMonth(),
   * which can overflow at month boundaries.
   */
  const zeroBasedMonth =
    month - 1;

  const totalMonths =
    zeroBasedMonth + months;

  const targetYear =
    year +
    Math.floor(
      totalMonths / 12
    );

  const targetMonth =
    ((totalMonths % 12) + 12) % 12;

  const daysInTargetMonth =
    getDaysInMonth(
      targetYear,
      targetMonth
    );

  const targetDay = Math.min(
    day,
    daysInTargetMonth
  );

  return [
    targetYear,
    String(targetMonth + 1).padStart(
      2,
      "0"
    ),
    String(targetDay).padStart(
      2,
      "0"
    ),
  ].join("-");
}