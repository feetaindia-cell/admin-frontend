export function formatCurrency(value, options = {}) {
  const amount = Number(value)
  const formatOptions = {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    ...options,
  }
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', formatOptions).format(amount)
    : 'Not available'
}

export function formatDate(value, includeTime = false) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-IN', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(date)
}

export function safeValue(value, fallback = 'Not available') {
  return value === undefined || value === null || value === '' ? fallback : value
}

export function titleCase(value) {
  return safeValue(value) === 'Not available'
    ? 'Not available'
    : String(value).replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function downloadCsv(filename, columns, rows) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const content = [columns.map((column) => escape(column.label)).join(',')]
  rows.forEach((row) => content.push(columns.map((column) => escape(column.value(row))).join(',')))
  const url = URL.createObjectURL(new Blob([`\uFEFF${content.join('\n')}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
