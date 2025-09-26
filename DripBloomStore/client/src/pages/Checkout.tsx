import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTelegram } from "@/hooks/use-telegram";
import { apiRequest } from "@/lib/queryClient";
import { convertUsdToRub, formatRub, formatPrice } from "@/lib/currency";

interface CartItemWithProduct {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    images: string[];
  };
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, sendData } = useTelegram();


  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: totalRub.toString(),
        shippingAmount: shippingRub.toString(),
        telegramUserId: user?.id,
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      // Send order data to Telegram bot
      sendData(JSON.stringify({
        action: "order_created",
        orderId: order.id,
        items: cartItems.map(item => ({
          name: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: totalRub.toString(),
        user: user ? {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
        } : null,
      }));
      
      setLocation("/success");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ. Попробуйте еще раз.",
        variant: "destructive",
      });
    },
  });

  const subtotalRub = cartItems.reduce(
    (sum, item) => sum + convertUsdToRub(item.product.price) * item.quantity,
    0
  );
  const shippingRub = 0; // Доставка бесплатная
  const totalRub = subtotalRub + shippingRub;

  if (isLoading) {
    return (
      <div className="px-4 py-6" data-testid="loading-checkout">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </div>
            <h1 className="text-xl font-semibold">Оформление заказа</h1>
            <div></div>
          </div>
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="px-4 py-6" data-testid="empty-checkout">
        <div className="container mx-auto max-w-md text-center">
          <p className="text-muted-foreground mb-4">Ваша корзина пуста</p>
          <Button onClick={() => setLocation("/")} data-testid="button-continue-shopping">
            Продолжить покупки
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" data-testid="page-checkout">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/cart")}
            className="flex items-center space-x-2 text-muted-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Назад</span>
          </button>
          <h1 className="text-xl font-semibold" data-testid="text-checkout-title">Оформление заказа</h1>
          <div></div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-[20px] shadow-lg p-6 mb-6" data-testid="order-summary">
          <h2 className="font-semibold text-card-foreground mb-4">Сводка заказа</h2>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
                data-testid={`order-item-${item.id}`}
              >
                <span>
                  {item.product.name} ({item.size}) × {item.quantity}
                </span>
                <span>{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Доставка</span>
              <span data-testid="text-checkout-shipping" className="text-green-600 font-medium">Бесплатно</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-semibold">
                <span>Итого</span>
                <span className="text-primary" data-testid="text-checkout-total">
                  {formatRub(totalRub)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram User Info */}
        <div className="bg-card rounded-[20px] shadow-lg p-6 mb-6" data-testid="telegram-user-info">
          <h2 className="font-semibold text-card-foreground mb-4">Информация о доставке</h2>
          <div className="space-y-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-blue-500"
                >
                  <path
                    d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
                    fill="currentColor"
                  />
                </svg>
                <div>
                  <p className="font-medium" data-testid="text-telegram-name">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.username && (
                    <p className="text-sm text-muted-foreground" data-testid="text-telegram-username">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground" data-testid="text-no-telegram">
                  Не подключен к Telegram
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Детали заказа будут отправлены в ваш Telegram для организации доставки.
            </p>
          </div>
        </div>

        {/* Confirm Order */}
        <Button
          className="btn-primary w-full py-4 rounded-[16px] font-semibold text-lg"
          onClick={() => createOrderMutation.mutate()}
          disabled={createOrderMutation.isPending}
          data-testid="button-confirm-order"
        >
          {createOrderMutation.isPending ? "Обработка..." : "Подтвердить заказ"}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Подтверждая заказ, вы соглашаетесь с нашими условиями. Подтверждение заказа будет отправлено в Telegram.
        </p>
      </div>
    </div>
  );
}
