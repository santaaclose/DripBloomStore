import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get all available sizes sorted in ascending order
  const allSizes = Array.from(new Set(products.flatMap(product => product.sizes)))
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Get all available ring names
  const allNames = Array.from(new Set(products.map(product => product.name)))
    .sort();

  // Get all available prices sorted in ascending order
  const allPrices = Array.from(new Set(products.map(product => product.price)))
    .sort((a, b) => parseFloat(a) - parseFloat(b));

  // Filter products based on search, size, name, and price
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Size filter
    if (selectedSize && !product.sizes.includes(selectedSize)) {
      return false;
    }
    
    // Name filter
    if (selectedName && product.name !== selectedName) {
      return false;
    }
    
    // Price filter
    if (selectedPrice && product.price !== selectedPrice) {
      return false;
    }
    
    return true;
  });


  const formatSizes = (sizes: string[]) => {
    return `Размер: ${sizes.join(' / ')}`;
  };

  return (
    <div data-testid="page-home">
      {/* Hero Carousel */}
      <section className="mb-6">
        {!isLoading && products.length > 0 && (
          <HeroCarousel products={products} />
        )}
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

      {/* Filters */}
      <section className="px-4 mb-6">
        <div className="container mx-auto space-y-4">
          {/* Search Filter */}
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
          
          {/* Individual Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Size Filter */}
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="flex-1 min-w-32 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-size"
            >
              <option value="">Все размеры</option>
              {allSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            
            {/* Name Filter */}
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="flex-1 min-w-48 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-name"
            >
              <option value="">Все кольца</option>
              {allNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            
            {/* Price Filter */}
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="flex-1 min-w-32 p-3 rounded-[16px] border border-border bg-card text-card-foreground text-sm"
              data-testid="select-price"
            >
              <option value="">Все цены</option>
              {allPrices.map(price => (
                <option key={price} value={price}>
                  {formatPrice(price)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
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
                  <div className="flex flex-col flex-grow" style={{ padding: '8px 12px 16px' }}>
                    <div className="flex-grow space-y-1">
                      <h3 
                        className="font-medium text-card-foreground leading-tight product-card-text-shadow"
                        data-testid={`text-product-name-${product.id}`}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.3',
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                          minHeight: '2.6em' // Ensure consistent height for 2 lines
                        }}
                      >
                        {product.name}
                      </h3>
                      <p 
                        className="text-primary font-semibold product-card-text-shadow" 
                        data-testid={`text-product-price-${product.id}`}
                        style={{
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)',
                          lineHeight: '1.2'
                        }}
                      >
                        {formatPrice(product.price)}
                      </p>
                      <p 
                        className="text-xs text-muted-foreground product-card-text-shadow" 
                        data-testid={`text-product-sizes-${product.id}`}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textShadow: '0 1px 1px rgba(255, 255, 255, 0.7)',
                          lineHeight: '1.2',
                          marginBottom: '12px'
                        }}
                      >
                        {formatSizes(product.sizes)}
                      </p>
                    </div>
                    <Button
                      className="btn-primary w-full py-2 rounded-[16px] text-sm font-medium mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/product/${product.id}`);
                      }}
                      data-testid={`button-view-details-${product.id}`}
                      style={{
                        minHeight: '36px' // Ensure consistent button height
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
            <div className="text-center py-12" data-testid="empty-products">
              <p className="text-muted-foreground">Товары в этой категории не найдены.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
