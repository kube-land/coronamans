export function parseDate(date: string) {
    let d = new Date(date)
    return `${d.toLocaleString()}`
}