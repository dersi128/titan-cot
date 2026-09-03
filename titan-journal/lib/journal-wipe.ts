export const JOURNAL_WIPE_CONFIRM = "DELETE"

export function confirmsJournalWipe(value: string): boolean {
  return value.trim().toUpperCase() === JOURNAL_WIPE_CONFIRM
}
