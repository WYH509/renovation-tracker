export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount)
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN')
}

export function getPaymentStatus(total: number, paid: number): 'unpaid' | 'partial' | 'paid' {
  if (paid <= 0) return 'unpaid'
  if (paid >= total) return 'paid'
  return 'partial'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'text-emerald-600'
    case 'partial': return 'text-amber-600'
    case 'unpaid': return 'text-red-600'
    default: return 'text-slate-600'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-emerald-100'
    case 'partial': return 'bg-amber-100'
    case 'unpaid': return 'bg-red-100'
    default: return 'bg-slate-100'
  }
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}