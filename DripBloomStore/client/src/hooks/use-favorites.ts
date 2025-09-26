import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export function useFavorites() {
  const { toast } = useToast();

  // Get all favorites
  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
  });

  // Check if a product is in favorites
  const isInFavorites = (productId: string) => {
    return favorites.some(fav => fav.productId === productId);
  };

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("POST", "/api/favorites", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/count"] });
      toast({
        title: "Добавлено в избранное!",
        description: "Товар добавлен в ваше избранное.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в избранное",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("DELETE", `/api/favorites/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/count"] });
      toast({
        title: "Удалено из избранного",
        description: "Товар удален из вашего избранного.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар из избранного",
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = async (productId: string) => {
    if (isInFavorites(productId)) {
      return removeFromFavoritesMutation.mutateAsync(productId);
    } else {
      return addToFavoritesMutation.mutateAsync(productId);
    }
  };

  return {
    favorites,
    isLoading,
    isInFavorites,
    toggleFavorite,
    isTogglingFavorite: addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending,
  };
}