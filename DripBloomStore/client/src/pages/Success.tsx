import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Success() {
  const [, setLocation] = useLocation();

  // Get order ID from URL params or generate a random one for demo
  const orderId = new URLSearchParams(window.location.search).get("orderId") || 
    `DB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return (
    <div className="px-4 py-6" data-testid="page-success">
      <div className="container mx-auto max-w-md text-center">
        <div className="bg-card rounded-[20px] shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" data-testid="icon-success" />
          </div>
          
          <h1 className="text-2xl font-bold text-card-foreground mb-2" data-testid="text-success-title">
            Заказ подтвержден!
          </h1>
          
          <p className="text-muted-foreground mb-6" data-testid="text-success-message">
            Спасибо за покупку! Мы отправим вам обновления заказа в Telegram.
          </p>
          
          <div className="bg-muted rounded-[16px] p-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Номер заказа</p>
            <p className="font-mono text-lg" data-testid="text-order-id">
              #{orderId}
            </p>
          </div>

          <Button
            className="btn-primary w-full py-4 rounded-[16px] font-semibold text-lg"
            onClick={() => setLocation("/")}
            data-testid="button-continue-shopping"
          >
            Продолжить покупки
          </Button>
        </div>
      </div>
    </div>
  );
}
