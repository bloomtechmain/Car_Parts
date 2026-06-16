export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(amount: number | null): string {
  if (amount === null || amount === undefined) return 'Price on request';
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    open: 'Open',
    replied: 'Replied',
    closed: 'Closed',
  };
  return map[status] || status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    replied: 'bg-gold/20 text-gold border-gold/30',
    closed: 'bg-green-500/20 text-green-300 border-green-500/30',
  };
  return map[status] || 'bg-slate-500/20 text-slate-300';
}
