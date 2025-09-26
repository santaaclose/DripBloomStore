import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { formatPrice } from "@/lib/currency";

interface FavoriteWithProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: string;
    images: string[];
  };
}

export default function Favorites() {
  const [, setLocation] = useLocation();


  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6" data-testid="loading-favorites">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">Избранное</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" data-testid="page-favorites">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6" data-testid="text-favorites-title">
          Избранное
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-favorites">
            <p className="text-muted-foreground mb-4">Ваше избранное пусто</p>
            <Button onClick={() => setLocation("/")} data-testid="button-browse-products">
              Посмотреть товары
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="favorites-grid">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="product-card bg-card rounded-[20px] shadow-md overflow-hidden"
                data-testid={`card-favorite-${favorite.id}`}
              >
                <img
                  src={favorite.product.images[0]}
                  alt={favorite.product.name}
                  className="w-full h-32 md:h-40 object-cover"
                  data-testid={`img-favorite-${favorite.id}`}
                />
                <div className="p-4">
                  <h3 className="font-medium text-card-foreground mb-1" data-testid={`text-favorite-name-${favorite.id}`}>
                    {favorite.product.name}
                  </h3>
                  <p className="text-primary font-semibold mb-3" data-testid={`text-favorite-price-${favorite.id}`}>
                    {formatPrice(favorite.product.price)}
                  </p>
                  <Button
                    className="btn-primary w-full py-2 rounded-[16px] text-sm font-medium"
                    onClick={() => setLocation(`/product/${favorite.productId}`)}
                    data-testid={`button-view-favorite-${favorite.id}`}
                  >
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
