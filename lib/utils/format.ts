export function formatBdt(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatMealRate(rate: number): string {
  return `৳${rate.toFixed(2)}/meal`;
}
