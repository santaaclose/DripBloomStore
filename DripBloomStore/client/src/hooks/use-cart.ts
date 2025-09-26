import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddToCartData {
  productId: string;
  size: string;
  quantity: number;
}

export function useCart() {
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartData) => {
      return await apiRequest("POST", "/api/cart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/count"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const addToCart = async (data: AddToCartData) => {
    return addToCartMutation.mutateAsync(data);
  };

  return {
    addToCart,
    isLoading: addToCartMutation.isPending,
  };
}
