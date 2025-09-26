import { 
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Favorite,
  type InsertFavorite,
  type Order,
  type InsertOrder
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  getCartCount(userId: string): Promise<number>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Favorites
  getFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  getFavoritesCount(userId: string): Promise<number>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private favorites: Map<string, Favorite>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.favorites = new Map();
    this.orders = new Map();

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Categories
    const ringsCategory: Category = {
      id: "cat-rings",
      name: "Rings",
      slug: "rings",
    };
    const setsCategory: Category = {
      id: "cat-sets",
      name: "Sets",
      slug: "sets",
    };
    const giftsCategory: Category = {
      id: "cat-gifts",
      name: "Gifts",
      slug: "gifts",
    };

    this.categories.set(ringsCategory.id, ringsCategory);
    this.categories.set(setsCategory.id, setsCategory);
    this.categories.set(giftsCategory.id, giftsCategory);

    // Products
    const products: Product[] = [
      {
        id: "prod-1",
        name: "Crystal Clear Ring",
        description: "Handcrafted from premium borosilicate glass, this crystal clear ring captures and reflects light beautifully. Each piece is unique, with subtle variations that make it truly one-of-a-kind. Perfect for everyday wear or special occasions.",
        price: "45.00",
        categoryId: ringsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod-2",
        name: "Rose Bloom Ring",
        description: "A beautiful rose-colored glass ring with intricate patterns that catch the light. Inspired by blooming flowers, this piece represents growth and beauty.",
        price: "52.00",
        categoryId: ringsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod-3",
        name: "Trinity Set",
        description: "A set of three matching glass rings in different sizes, perfect for stacking or wearing individually. Each ring complements the others beautifully.",
        price: "125.00",
        categoryId: setsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod-4",
        name: "Amber Dreams",
        description: "An amber-colored glass ring with golden undertones that glow in warm lighting. This piece evokes feelings of warmth and comfort.",
        price: "48.00",
        categoryId: ringsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod-5",
        name: "Gift Box Special",
        description: "Beautifully packaged glass ring in an elegant gift box with ribbon. Perfect for special occasions and gift-giving.",
        price: "85.00",
        categoryId: giftsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod-6",
        name: "Ocean Wave",
        description: "A deep blue glass ring with swirled patterns that reflect light like ocean waves. This piece captures the beauty and movement of water.",
        price: "55.00",
        categoryId: ringsCategory.id,
        images: [
          "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
        ],
        sizes: ["XS", "S", "M", "L"],
        inStock: true,
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      lastName: insertUser.lastName ?? null,
      username: insertUser.username ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      categoryId: insertProduct.categoryId ?? null,
      inStock: insertProduct.inStock ?? true,
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  // Cart
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    // Load products from JSON file instead of in-memory storage
    const products = await import("../src/data/products.json");
    const productList = products.default;
    
    // Filter out cart items where product doesn't exist and return valid ones
    const results: (CartItem & { product: Product })[] = [];
    
    for (const item of userCartItems) {
      const product = productList.find(p => p.id === item.productId);
      if (product) {
        // Convert JSON product to Product type
        const productData: Product = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          categoryId: product.category || null,
          images: product.images,
          sizes: product.sizes,
          inStock: product.available || false,
          createdAt: new Date()
        };
        results.push({ ...item, product: productData });
      }
    }
    
    return results;
  }

  async getCartCount(userId: string): Promise<number> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => 
        item.userId === insertCartItem.userId && 
        item.productId === insertCartItem.productId && 
        item.size === insertCartItem.size
      );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCartItem.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { 
      ...insertCartItem,
      id, 
      userId: insertCartItem.userId ?? null,
      productId: insertCartItem.productId ?? null,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date() 
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    cartItem.quantity = quantity;
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    const itemsToDelete: string[] = [];
    this.cartItems.forEach((item, id) => {
      if (item.userId === userId) {
        itemsToDelete.push(id);
      }
    });
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  // Favorites
  async getFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    // Load products from JSON file instead of in-memory storage
    const products = await import("../src/data/products.json");
    const productList = products.default;
    
    // Filter out favorites where product doesn't exist and return valid ones
    const results: (Favorite & { product: Product })[] = [];
    
    for (const fav of userFavorites) {
      const product = productList.find(p => p.id === fav.productId);
      if (product) {
        // Convert JSON product to Product type
        const productData: Product = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          categoryId: product.category || null,
          images: product.images,
          sizes: product.sizes,
          inStock: product.available || false,
          createdAt: new Date()
        };
        results.push({ ...fav, product: productData });
      }
    }
    
    return results;
  }

  async getFavoritesCount(userId: string): Promise<number> {
    return Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId).length;
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { 
      ...insertFavorite,
      id, 
      userId: insertFavorite.userId ?? null,
      productId: insertFavorite.productId ?? null,
      createdAt: new Date() 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    let idToDelete: string | null = null;
    this.favorites.forEach((fav, id) => {
      if (fav.userId === userId && fav.productId === productId) {
        idToDelete = id;
      }
    });
    if (idToDelete) {
      this.favorites.delete(idToDelete);
    }
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id,
      userId: insertOrder.userId ?? null,
      status: insertOrder.status || "pending",
      telegramOrderId: insertOrder.telegramOrderId ?? null,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();
