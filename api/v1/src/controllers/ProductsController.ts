import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';
import { Product } from '../types';

class ProductsController {
  private static readonly CACHE_TTL = 3600; // 1 hour

  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      const search = req.query.search as string;
      const sort = req.query.sort as string || 'name';
      const order = req.query.order as string || 'asc';

      const filter: any = {};
      if (search) {
        filter.$text = { $search: search };
      }

      const products = mongoClient.db.collection<Product>('products');
      const [items, total] = await Promise.all([
        products.find<Product>(filter)
          .sort({ [sort]: order === 'asc' ? 1 : -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        products.countDocuments(filter)
      ]);

      return res.status(200).json({
        data: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });

    } catch (err) {
      console.error('Error getting products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const cacheKey = `product:${id}`;
      const cachedProduct = await redisClient.get(cacheKey);
      
      if (cachedProduct) {
        return res.status(200).json(JSON.parse(cachedProduct));
      }

      const products = mongoClient.db.collection<Product>('products');
      const product = await products.findOne<Product>({ _id: new ObjectId(id) });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await redisClient.set(cacheKey, JSON.stringify(product), ProductsController.CACHE_TTL);
      return res.status(200).json(product);

    } catch (err) {
      console.error('Error getting product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProductStock(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      if (typeof stock !== 'string' && typeof stock !== 'number') {
        return res.status(400).json({ error: 'Stock must be a string or number' });
      }

      // Convert stock to string if it's a number
      const stockValue = stock.toString();

      const products = mongoClient.db.collection<Product>('products');
      const result = await products.updateOne(
        { _id: new ObjectId(id) },
        { $set: { stock: stockValue } }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const cacheKey = `product:${id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json({ message: 'Stock updated successfully' });

    } catch (err) {
      console.error('Error updating stock:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { stock, ...updates } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      if (stock !== undefined && typeof stock !== 'string' && typeof stock !== 'number') {
        return res.status(400).json({ error: 'Stock must be a string or number' });
      }

      const stockValue = stock !== undefined ? stock.toString() : undefined;

      const products = mongoClient.db.collection<Product>('products');
      const result = await products.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updates,
            ...(stockValue !== undefined && { stock: stockValue }),
            updated_at: new Date()
          } 
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const cacheKey = `product:${id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json({ message: 'Product updated successfully' });

    } catch (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const products = mongoClient.db.collection<Product>('products');
      const result = await products.deleteOne({ _id: new ObjectId(id) });

      if (!result.deletedCount) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const cacheKey = `product:${id}`;
      await redisClient.del(cacheKey);

      return res.status(200).json({ message: 'Product deleted successfully' });

    } catch (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default ProductsController;
