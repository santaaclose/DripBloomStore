import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@shared/schema";
import productsData from "../../data/products.json";


export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  // ✅ Берём товары напрямую
  const products: Product[] = productsData;
  const isLoading = false;

  // Все доступные размеры
  const allSizes = Array.from(new Set(products.flatMap(product => product.sizes)))
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Все названия колец
  const allNames = Array.from(new Set(products.map(product => product.name))).sort();

  // Все цены
  const allPrices = Array.from(new Set(products.map(product => product.price)))
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Фильтрация
  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedSize && !product.sizes.includes(selectedSize)) return false;
    if (selectedName && product.name !== selectedName) return false;
    if (selectedPrice && product.price !== selectedPrice) return false;
    return true;
  });

  const formatSizes = (sizes: string[]) => `Размер: ${sizes.join(" / ")}`;

  return (
    <div data-testid="page-home">
      {/* Шапка с каруселью */}
      <section className="mb-6">
        {!isLoading && products.length > 0 && <HeroCarousel products={products} />}
        {isLoading && (
          <div className="hero-section rounded-b-[40px] px-4 py-8 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
            <div className="container mx-auto">
              <Skeleton className="w-full h-48 rounded-[20px] mb-6" />
              <div className="text-center">
                <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Фильтры */}
      <section className="px-4 mb-6">
        <div className="container mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-[16px]"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="flex-1 min-w-32 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-size"
            >
              <option value="">Все размеры</option>
              {allSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="flex-1 min-w-48 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-name"
            >
              <option value="">Все кольца</option>
              {allNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="flex-1 min-w-32 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-price"
            >
              <option value="">Все цены</option>
              {allPrices.map(price => (
                <option key={price} value={price}>{formatPrice(price)}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Сетка товаров */}
      <section className="px-4 mb-20">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-[20px] shadow-md overflow-hidden">
                  <Skeleton className="w-full h-32 md:h-40" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="product-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card bg-card rounded-[20px] shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full"
                  onClick={() => setLocation(`/product/${product.id}`)}
                  data-testid={`card-product-${product.id}`}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-32 md:h-40 object-cover flex-shrink-0"
                    data-testid={`img-product-${product.id}`}
                  />
                  <div className="flex flex-col flex-grow p-3">
                    <div className="flex-grow space-y-1">
                      <h3
                        className="font-medium text-card-foreground leading-tight"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: "1.3",
                          minHeight: "2.6em"
                        }}
                      >
                        {product.name}
                      </h3>
                      <p className="text-primary font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSizes(product.sizes)}
                      </p>
                    </div>
                    <Button
                      className="btn-primary w-full py-2 rounded-[16px] text-sm font-medium mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/product/${product.id}`);
                      }}
                    >
                      Подробнее
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Товары в этой категории не найдены.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
