import products from "../src/data/products.json"; // если папка data лежит в src
// если data лежит прямо в корне (public/src нет), замени на: "../data/products.json"

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCartItemSchema,
  insertFavoriteSchema,
  insertOrderSchema,
} from "@shared/schema";
import { z } from "zod";
import { notifySellerAboutOrder } from "./telegram";

export async function registerRoutes(app: Express): Promise<Server> {
  // ---------- Products ----------
  // Отдать весь список товаров из products.json
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  // Отдать конкретный товар по id
  app.get("/api/products/:id", (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // ---------- Cart ----------
  app.get("/api/cart", async (_req, res) => {
    try {
      const cartItems = await storage.getCartItems("demo-user");
      res.json(cartItems);
    } catch {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.get("/api/cart/count", async (_req, res) => {
    try {
      const count = await storage.getCartCount("demo-user");
      res.json(count);
    } catch {
      res.status(500).json({ message: "Failed to fetch cart count" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validated = insertCartItemSchema.parse({
        ...req.body,
        userId: "demo-user",
      });
      const cartItem = await storage.addToCart(validated);
      res.json(cartItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      if (!cartItem)
        return res.status(404).json({ message: "Cart item not found" });
      res.json(cartItem);
    } catch {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // ---------- Favorites ----------
  app.get("/api/favorites", async (_req, res) => {
    try {
      const favorites = await storage.getFavorites("demo-user");
      res.json(favorites);
    } catch {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.get("/api/favorites/count", async (_req, res) => {
    try {
      const count = await storage.getFavoritesCount("demo-user");
      res.json(count);
    } catch {
      res.status(500).json({ message: "Failed to fetch favorites count" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validated = insertFavoriteSchema.parse({
        ...req.body,
        userId: "demo-user",
      });
      const favorite = await storage.addToFavorites(validated);
      res.json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:productId", async (req, res) => {
    try {
      await storage.removeFromFavorites("demo-user", req.params.productId);
      res.json({ message: "Removed from favorites" });
    } catch {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // ---------- Orders ----------
  app.post("/api/orders", async (req, res) => {
    try {
      const validated = insertOrderSchema.parse({
        ...req.body,
        userId: "demo-user",
        status: "pending",
      });
      const order = await storage.createOrder(validated);
      await storage.clearCart("demo-user"); // очистка корзины после заказа
      
      // Send notification to seller via Telegram
      try {
        const notificationData = {
          orderId: order.id,
          items: req.body.items || [],
          totalAmount: req.body.totalAmount || "0",
          shippingAmount: req.body.shippingAmount || "0",
          customerInfo: req.body.telegramUserId ? {
            id: req.body.telegramUserId,
            firstName: req.body.customerFirstName,
            lastName: req.body.customerLastName,
            username: req.body.customerUsername,
          } : undefined,
        };
        
        const notificationSent = await notifySellerAboutOrder(notificationData);
        if (notificationSent) {
          console.log(`Order notification sent successfully for order ${order.id}`);
        } else {
          console.log(`Order notification failed for order ${order.id}`);
        }
      } catch (notificationError) {
        console.error('Failed to send order notification:', notificationError);
        // Don't fail the order creation if notification fails
      }
      
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
