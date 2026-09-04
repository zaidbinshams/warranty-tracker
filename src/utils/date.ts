export function addMonths(
    dateString: string,
    months: number
): string {
    const date = new Date(dateString);

    date.setMonth(date.getMonth() + months);

    return date.toISOString().split("T")[0];
}