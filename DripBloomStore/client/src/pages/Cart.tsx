import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice, convertUsdToRub, formatRub } from "@/lib/currency";

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

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();


  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        return await apiRequest("DELETE", `/api/cart/${itemId}`);
      }
      return await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар в корзине",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
      toast({
        title: "Товар удален",
        description: "Товар удален из вашей корзины",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар из корзины",
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
      <div className="px-4 py-6" data-testid="loading-cart">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </div>
            <h1 className="text-xl font-semibold">Корзина</h1>
            <div></div>
          </div>
          <div className="space-y-4 mb-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-card rounded-[20px] shadow-lg p-4">
                <div className="flex space-x-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" data-testid="page-cart">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2 text-muted-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Назад</span>
          </button>
          <h1 className="text-xl font-semibold" data-testid="text-cart-title">Корзина</h1>
          <div></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-cart">
            <p className="text-muted-foreground mb-4">Ваша корзина пуста</p>
            <Button onClick={() => setLocation("/")} data-testid="button-continue-shopping">
              Продолжить покупки
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-[20px] shadow-lg p-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="flex space-x-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      data-testid={`img-cart-item-${item.id}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-size-${item.id}`}>
                        Размер: {item.size}
                      </p>
                      <p className="text-primary font-semibold" data-testid={`text-cart-item-price-${item.id}`}>
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => removeItemMutation.mutate(item.id)}
                        className="text-destructive hover:text-destructive/80"
                        disabled={removeItemMutation.isPending}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity - 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-card rounded-[20px] shadow-lg p-6 mb-6" data-testid="cart-summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Стоимость товаров</span>
                  <span data-testid="text-subtotal">{formatRub(subtotalRub)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span data-testid="text-shipping" className="text-green-600 font-medium">Бесплатно</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Итого</span>
                    <span className="text-primary" data-testid="text-total">
                      {formatRub(totalRub)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              className="btn-primary w-full py-4 rounded-[16px] font-semibold text-lg"
              onClick={() => setLocation("/checkout")}
              data-testid="button-checkout"
            >
              Оформить заказ
            </Button>

            {/* Cart Status Information */}
            <div className="mt-6 p-4 bg-muted/30 rounded-[16px] text-center" data-testid="cart-status-info">
              <p className="text-sm text-muted-foreground">
                🛍️ У вас {cartItems.length} {cartItems.length === 1 ? 'товар' : cartItems.length >= 2 && cartItems.length <= 4 ? 'товара' : 'товаров'} в корзине
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Товары сохранены и готовы к оформлению заказа
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
