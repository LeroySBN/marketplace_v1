import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { User, Product, Order, Delivery, CartItem } from '../types';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';
import { hashPassword } from '../utils/auth';

class UsersController {
  static async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const users = mongoClient.db.collection<User>('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, ...userData } = user;
      return res.status(200).json(userData);

    } catch (err) {
      console.error('Error getting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const updates = req.body;
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      const users = mongoClient.db.collection<User>('users');
      const result = await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { ...updates, updated_at: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'User updated successfully' });

    } catch (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const users = mongoClient.db.collection<User>('users');
      const result = await users.deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await redisClient.del(`auth_${token}`);
      return res.status(200).json({ message: 'User deleted successfully' });

    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserProducts(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const orders = mongoClient.db.collection<Order>('orders');
      const userOrders = await orders.find({ userId: new ObjectId(userId) }).toArray();
      const productIds = userOrders.flatMap(order => order.items.map(item => item.productId));
      const uniqueProductIds = [...new Set(productIds.map(id => id.toString()))].map(id => new ObjectId(id));

      const products = mongoClient.db.collection<Product>('products');
      const [items, total] = await Promise.all([
        products.find({ _id: { $in: uniqueProductIds } })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        products.countDocuments({ _id: { $in: uniqueProductIds } })
      ]);

      return res.status(200).json({
        data: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });

    } catch (err) {
      console.error('Error getting user products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserCart(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const users = mongoClient.db.collection<User>('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user.cart || []);

    } catch (err) {
      console.error('Error getting user cart:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async postUserCart(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const productId = req.body.id;
      const quantity = req.body.quantity;

      if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
      }

      if (!quantity) {
        return res.status(400).json({ error: 'Missing quantity' });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Quantity should be a positive integer' });
      }

      const products = mongoClient.db.collection<Product>('products');
      const product = await products.findOne({ _id: new ObjectId(productId) });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const stock = parseInt(product.stock);
      if (stock < quantity) {
        return res.status(400).json({ error: 'Not enough stock' });
      }

      const users = mongoClient.db.collection<User>('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const cart = user.cart || [];
      const cartItem: CartItem = {
        _id: new ObjectId(),
        productId: new ObjectId(productId),
        vendorId: product.vendorId,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        dateCreated: new Date().toISOString()
      };

      const existingItemIndex = cart.findIndex(item => item.productId.toString() === productId);
      if (existingItemIndex !== -1) {
        cart[existingItemIndex] = cartItem;
      } else {
        cart.push(cartItem);
      }

      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { cart, updated_at: new Date() } }
      );

      return res.status(200).json(cartItem);

    } catch (err) {
      console.error('Error adding product to cart:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUserCartItem(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const productId = req.params.id;

      if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
      }

      const users = mongoClient.db.collection<User>('users');
      const user = await users.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const cart = user.cart || [];
      const itemIndex = cart.findIndex(item => item.productId.toString() === productId);

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Product not in cart' });
      }

      cart.splice(itemIndex, 1);
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { cart, updated_at: new Date() } }
      );

      return res.status(200).json(cart);

    } catch (err) {
      console.error('Error removing product from cart:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserOrders(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const orders = mongoClient.db.collection<Order>('orders');
      const [items, total] = await Promise.all([
        orders.find({ userId: new ObjectId(userId) })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        orders.countDocuments({ userId: new ObjectId(userId) })
      ]);

      return res.status(200).json({
        data: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });

    } catch (err) {
      console.error('Error getting user orders:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserDeliveries(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const deliveries = mongoClient.db.collection<Delivery>('deliveries');
      const [items, total] = await Promise.all([
        deliveries.find({ userId: new ObjectId(userId) })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        deliveries.countDocuments({ userId: new ObjectId(userId) })
      ]);

      return res.status(200).json({
        data: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });

    } catch (err) {
      console.error('Error getting user deliveries:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
