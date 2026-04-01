// Utility helpers only — all data now comes from the database

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month:    'short',
    year:     'numeric',
    timeZone: 'UTC',
  })
}
