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
// ✅ грузим данные напрямую из public/products.json
import productsData from "/products.json";

export default function Product() {
  const { id } = useParams();                        // id из адресной строки
  const [, setLocation] = useLocation();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isInFavorites, toggleFavorite, isTogglingFavorite } = useFavorites();

  // ✅ ищем товар прямо в JSON
  const products: Product[] = productsData as Product[];
  const product = products.find((p) => p.id === id);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      toast({
        title: "Пожалуйста, выберите размер",
        description: "Выберите размер перед добавлением в корзину",
        variant: "destructive",
      });
      return;
    }

    await addToCart({
      productId: product.id,
      size: selectedSize,
      quantity: 1,
    });

    setShowAddToCartModal(true);
  };

  // 👉 если товар не найден
  if (!product) {
    return (
      <div className="px-4 py-6 text-center">
        <p>Товар не найден</p>
        <Button onClick={() => setLocation("/")}>Вернуться домой</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="container mx-auto max-w-md">

        {/* Кнопка назад */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center space-x-2 mb-6 text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад</span>
        </button>

        {/* Фото товара */}
        <div className="bg-card rounded-[20px] shadow-lg overflow-hidden mb-6">
          <img
            src={product.images[selectedImageIndex]}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <div className="flex space-x-2 p-4">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={product.name}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer ${
                  selectedImageIndex === idx ? "opacity-100" : "opacity-50 hover:opacity-100"
                }`}
                onClick={() => setSelectedImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="bg-card rounded-[20px] shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-primary font-semibold mb-4">{formatPrice(product.price)}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Размер</h3>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`border-2 rounded-lg py-2 px-3 ${
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <Button className="btn-primary w-full mb-3" onClick={handleAddToCart}>
            Добавить в корзину
          </Button>

          <Button
            variant="outline"
            className="w-full border-2 border-primary text-primary"
            onClick={() => toggleFavorite(product.id)}
            disabled={isTogglingFavorite}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isInFavorites(product.id) ? "fill-current" : ""}`}
            />
            {isInFavorites(product.id) ? "Убрать из избранного" : "Добавить в избранное"}
          </Button>
        </div>
      </div>

      {/* Модалка добавления в корзину */}
      <Dialog open={showAddToCartModal} onOpenChange={setShowAddToCartModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle>Товар добавлен в корзину! 🛍️</DialogTitle>
            <DialogDescription>
              {product.name} ({selectedSize}) добавлен в корзину.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setLocation("/cart")} className="btn-primary w-full mt-4">
            Перейти в корзину
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
