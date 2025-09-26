import { Heart, ShoppingBag } from "lucide-react";
import BottomNavigation from "./BottomNavigation";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  
  // Get cart count
  const { data: cartCount = 0 } = useQuery<number>({
    queryKey: ["/api/cart/count"],
  });

  // Get favorites count
  const { data: favoritesCount = 0 } = useQuery<number>({
    queryKey: ["/api/favorites/count"],
  });

  const showHeader = !location.includes('/checkout') && !location.includes('/success');

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header className="sticky top-0 z-50 glass-effect" data-testid="header">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/logo/drip_bloom_logo.png"
                  alt="Drip Bloom"
                  className="h-8 w-8 object-contain"
                  data-testid="logo-icon"
                />
                <h1 className="text-xl font-semibold text-foreground" data-testid="logo-text">
                  Drip Bloom
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  className="relative hover:text-primary transition-colors" 
                  onClick={() => setLocation("/favorites")}
                  data-testid="button-favorites"
                >
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  {favoritesCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      data-testid="text-favorites-count"
                    >
                      {favoritesCount}
                    </span>
                  )}
                </button>
                <button 
                  className="relative hover:text-primary transition-colors" 
                  onClick={() => setLocation("/cart")}
                  data-testid="button-cart"
                >
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      data-testid="text-cart-count"
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="pb-20">
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
}
