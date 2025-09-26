interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
  price: string;
}

interface OrderNotification {
  orderId: string;
  items: OrderItem[];
  totalAmount: string;
  shippingAmount: string;
  customerInfo?: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendTelegramMessage(chatId: string, message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
    return false;
  }

  try {
    const telegramMessage: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramMessage),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Telegram message:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('Telegram message sent successfully:', data.result.message_id);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export function formatOrderMessage(order: OrderNotification): string {
  const { orderId, items, totalAmount, shippingAmount, customerInfo } = order;
  
  let message = `🛍️ <b>Новый заказ #${escapeHtml(orderId)}</b>\n\n`;
  
  // Customer information
  if (customerInfo) {
    message += `👤 <b>Покупатель:</b>\n`;
    message += `• ID: ${customerInfo.id}\n`;
    if (customerInfo.firstName || customerInfo.lastName) {
      const firstName = customerInfo.firstName ? escapeHtml(customerInfo.firstName) : '';
      const lastName = customerInfo.lastName ? escapeHtml(customerInfo.lastName) : '';
      message += `• Имя: ${firstName} ${lastName}`.trim() + '\n';
    }
    if (customerInfo.username) {
      message += `• Username: @${escapeHtml(customerInfo.username)}\n`;
    }
    message += '\n';
  }
  
  // Order items
  message += `📦 <b>Товары:</b>\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. <b>${escapeHtml(item.productName)}</b>\n`;
    message += `   Размер: ${escapeHtml(item.size)}\n`;
    message += `   Количество: ${item.quantity}\n`;
    message += `   Цена: ${escapeHtml(item.price)} ₽\n\n`;
  });
  
  // Total information
  message += `💰 <b>Итого:</b>\n`;
  message += `• Товары: ${escapeHtml(totalAmount)} ₽\n`;
  message += `• Доставка: ${escapeHtml(shippingAmount)} ₽\n`;
  
  const total = (parseFloat(totalAmount) + parseFloat(shippingAmount)).toFixed(2);
  message += `• <b>Общая сумма: ${escapeHtml(total)} ₽</b>\n\n`;
  
  message += `📞 Свяжитесь с покупателем для подтверждения заказа!`;
  
  return message;
}

export async function notifySellerAboutOrder(order: OrderNotification): Promise<boolean> {
  // The seller's numeric chat ID - must be obtained when the seller sends /start to the bot
  const sellerChatId = process.env.SELLER_CHAT_ID;
  
  if (!sellerChatId) {
    console.error('SELLER_CHAT_ID not found in environment variables. The seller must send /start to the bot first to obtain their chat ID.');
    return false;
  }
  
  const message = formatOrderMessage(order);
  
  console.log('Sending order notification to seller chat ID:', sellerChatId);
  return await sendTelegramMessage(sellerChatId, message);
}