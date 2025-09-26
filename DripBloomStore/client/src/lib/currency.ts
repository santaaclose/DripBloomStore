// USD to RUB conversion rate (you can make this configurable via env vars in production)
const USD_TO_RUB_RATE = 90; // Approximate rate as of 2024

export function convertUsdToRub(usdAmount: string | number): number {
  const usdValue = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  return Math.round(usdValue * USD_TO_RUB_RATE);
}

export function formatPrice(usdPrice: string | number): string {
  const rubPrice = convertUsdToRub(usdPrice);
  return `₽${rubPrice.toLocaleString('ru-RU')}`;
}

export function formatRub(rubAmount: number): string {
  return `₽${rubAmount.toLocaleString('ru-RU')}`;
}

export function formatShipping(): string {
  const shippingRub = convertUsdToRub(5.0); // Convert $5 shipping to rubles
  return `₽${shippingRub.toLocaleString('ru-RU')}`;
}

export function calculateTotalInRub(items: Array<{price: string; quantity: number}>): number {
  const subtotal = items.reduce((sum, item) => {
    return sum + convertUsdToRub(item.price) * item.quantity;
  }, 0);
  const shipping = convertUsdToRub(5.0);
  return subtotal + shipping;
}