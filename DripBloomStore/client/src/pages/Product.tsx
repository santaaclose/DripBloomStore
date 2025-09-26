import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@shared/schema";

export default function Product() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isInFavorites, toggleFavorite, isTogglingFavorite } = useFavorites();


  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

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

    try {
      await addToCart({
        productId: product.id,
        size: selectedSize,
        quantity: 1,
      });
      
      setShowAddToCartModal(true);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6" data-testid="loading-product">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center space-x-2 mb-6">
            <ArrowLeft className="h-5 w-5" />
            <span>Назад</span>
          </div>
          <div className="bg-card rounded-[20px] shadow-lg overflow-hidden mb-6">
            <Skeleton className="w-full h-64" />
            <div className="flex space-x-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="bg-card rounded-[20px] shadow-lg p-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-6" data-testid="product-not-found">
        <div className="container mx-auto max-w-md text-center">
          <p>Товар не найден</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Вернуться домой
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" data-testid="page-product">
      <div className="container mx-auto max-w-md">
        {/* Back Button */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center space-x-2 text-muted-foreground mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Назад</span>
        </button>

        {/* Product Images Carousel */}
        <div className="bg-card rounded-[20px] shadow-lg overflow-hidden mb-6">
          <img
            src={product.images[selectedImageIndex]}
            alt={`${product.name} main view`}
            className="w-full h-64 object-cover"
            data-testid="img-product-main"
          />
          
          <div className="flex space-x-2 p-4">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} view ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-opacity ${
                  selectedImageIndex === index ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => setSelectedImageIndex(index)}
                data-testid={`img-product-thumbnail-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-card rounded-[20px] shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-card-foreground mb-2" data-testid="text-product-name">
            {product.name}
          </h1>
          
          <div className="mb-6">
            <h3 className="font-semibold text-card-foreground mb-2">Описание</h3>
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-product-description">
              {product.description}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-card-foreground mb-3">Размер</h3>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`border-2 rounded-lg py-2 px-3 text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  }`}
                  onClick={() => setSelectedSize(size)}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="btn-primary w-full py-4 rounded-[16px] font-semibold text-lg"
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              Добавить в корзину
            </Button>
            <Button
              variant="outline"
              className="w-full py-4 rounded-[16px] font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => product && toggleFavorite(product.id)}
              disabled={isTogglingFavorite}
              data-testid="button-add-to-favorites"
            >
              <Heart className={`mr-2 h-4 w-4 ${product && isInFavorites(product.id) ? 'fill-current' : ''}`} />
              {product && isInFavorites(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add to Cart Success Modal */}
      <Dialog open={showAddToCartModal} onOpenChange={setShowAddToCartModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              Товар добавлен в корзину! 🛍️
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {product && `${product.name} (${selectedSize}) добавлен в вашу корзину. Доставка бесплатная!`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-6">
            <Button
              className="w-full py-3 rounded-[16px] font-semibold"
              variant="outline"
              onClick={() => {
                setShowAddToCartModal(false);
                setLocation("/");
              }}
              data-testid="button-continue-shopping"
            >
              Продолжить покупки
            </Button>
            <Button
              className="btn-primary w-full py-3 rounded-[16px] font-semibold"
              onClick={() => {
                setShowAddToCartModal(false);
                setLocation("/cart");
              }}
              data-testid="button-go-to-cart"
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
