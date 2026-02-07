export function parseLocalDate(dateString: string): Date {
    // Parses yyyy-MM-dd string as a local Date (at 00:00:00)
    // This avoids the UTC conversion issue with new Date("yyyy-MM-dd")
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}
