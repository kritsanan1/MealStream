import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertRestaurantSchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertDeliverySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Restaurant routes
  app.get('/api/restaurants', async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get('/api/restaurants/:id', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.get('/api/restaurants/:id/menu', async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const menuItems = await storage.getMenuItems(restaurantId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/restaurants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'vendor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const restaurantData = insertRestaurantSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  // Menu item routes
  app.post('/api/menu-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'vendor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'vendor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const menuItemId = parseInt(req.params.id);
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(menuItemId, menuItemData);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let orders;
      switch (user?.role) {
        case 'customer':
          orders = await storage.getOrdersByCustomer(userId);
          break;
        case 'vendor':
          const restaurants = await storage.getRestaurantsByOwner(userId);
          orders = [];
          for (const restaurant of restaurants) {
            const restaurantOrders = await storage.getOrdersByRestaurant(restaurant.id);
            orders.push(...restaurantOrders);
          }
          break;
        case 'driver':
          orders = await storage.getOrdersByDriver(userId);
          break;
        case 'admin':
          orders = await storage.getOrders();
          break;
        default:
          return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const orderItems = await storage.getOrderItems(orderId);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'customer') {
        return res.status(403).json({ message: "Only customers can place orders" });
      }

      const { items, ...orderData } = req.body;
      
      const orderToCreate = insertOrderSchema.parse({
        ...orderData,
        customerId: userId,
      });
      
      const order = await storage.createOrder(orderToCreate);
      
      // Create order items
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          ...item,
          orderId: order.id,
        });
        await storage.createOrderItem(orderItemData);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const orderId = req.params.id;
      
      if (user?.role !== 'vendor' && user?.role !== 'driver' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(orderId, orderData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Delivery routes
  app.get('/api/deliveries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let deliveries;
      switch (user?.role) {
        case 'driver':
          deliveries = await storage.getDeliveriesByDriver(userId);
          break;
        case 'admin':
          deliveries = await storage.getDeliveries();
          break;
        default:
          return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post('/api/deliveries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      console.error("Error creating delivery:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.put('/api/deliveries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const deliveryId = parseInt(req.params.id);
      
      if (user?.role !== 'driver' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deliveryData = insertDeliverySchema.partial().parse(req.body);
      const delivery = await storage.updateDelivery(deliveryId, deliveryData);
      res.json(delivery);
    } catch (error) {
      console.error("Error updating delivery:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
