import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@shared/schema";
import productsData from "../../data/products.json";  // ✅ грузим локальный JSON

export default function ProductPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isInFavorites, toggleFavorite, isTogglingFavorite } = useFavorites();

  // ✅ ищем товар по id в products.json
  const product: Product | undefined = (productsData as Product[]).find((p) => p.id === id);

  if (!product) {
    return (
      <div className="px-4 py-6 text-center">
        <p>Товар не найден</p>
        <Button onClick={() => setLocation("/")} className="mt-4">
          Вернуться домой
        </Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Пожалуйста, выберите размер",
        description: "Выберите размер перед добавлением в корзину",
        variant: "destructive",
      });
      return;
    }

    await addToCart({ productId: product.id, size: selectedSize, quantity: 1 });
    setShowAddToCartModal(true);
  };

  return (
    <div className="px-4 py-6">
      <div className="container mx-auto max-w-md">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center space-x-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад</span>
        </button>

        <div className="bg-card rounded-[20px] shadow-lg overflow-hidden mb-6">
          <img
            src={product.images[selectedImageIndex]}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <div className="flex space-x-2 p-4">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer ${
                  selectedImageIndex === index ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-[20px] shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="mb-4">{product.description}</p>
          <p className="text-primary font-semibold text-lg mb-6">{formatPrice(product.price)}</p>

          <h3 className="font-semibold mb-2">Размер</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border-2 rounded-lg py-2 px-3 text-sm font-medium ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              className="btn-primary w-full py-4 rounded-[16px] font-semibold text-lg"
              onClick={handleAddToCart}
            >
              Добавить в корзину
            </Button>
            <Button
              variant="outline"
              className="w-full py-4 rounded-[16px] font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => toggleFavorite(product.id)}
              disabled={isTogglingFavorite}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isInFavorites(product.id) ? "fill-current" : ""}`}
              />
              {isInFavorites(product.id) ? "Удалить из избранного" : "Добавить в избранное"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showAddToCartModal} onOpenChange={setShowAddToCartModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle>Товар добавлен в корзину! 🛍️</DialogTitle>
            <DialogDescription>
              {`${product.name} (${selectedSize}) добавлен в вашу корзину.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            <Button
              variant="outline"
              className="w-full py-3 rounded-[16px] font-semibold"
              onClick={() => {
                setShowAddToCartModal(false);
                setLocation("/");
              }}
            >
              Продолжить покупки
            </Button>
            <Button
              className="btn-primary w-full py-3 rounded-[16px] font-semibold"
              onClick={() => {
                setShowAddToCartModal(false);
                setLocation("/cart");
              }}
            >
              Оформить заказ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
