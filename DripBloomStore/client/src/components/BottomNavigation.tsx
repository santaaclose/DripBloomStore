import { Home, Heart, ShoppingBag, User } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Главная", path: "/", testId: "nav-home" },
    { icon: Heart, label: "Избранное", path: "/favorites", testId: "nav-favorites" },
    { icon: ShoppingBag, label: "Корзина", path: "/cart", testId: "nav-cart" },
    { icon: User, label: "Профиль", path: "/profile", testId: "nav-profile" },
  ];

  return (
    <nav className="floating-nav fixed bottom-0 left-0 right-0 z-50" data-testid="bottom-navigation">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map(({ icon: Icon, label, path, testId }) => (
            <Link key={path} href={path}>
              <button
                className={`nav-item flex flex-col items-center space-y-1 transition-colors ${
                  location === path ? "active" : "text-muted-foreground"
                }`}
                data-testid={testId}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
