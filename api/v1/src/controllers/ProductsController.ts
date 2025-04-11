import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Product, ProductQuery, PaginatedResponse } from '../types/product';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

class ProductsController {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly CACHE_TTL = 300; // 5 minutes

  private static buildQuery(query: ProductQuery) {
    const filter: any = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    return filter;
  }

  private static buildSort(query: ProductQuery) {
    if (!query.sortBy) return { created_at: -1 };
    
    return {
      [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1
    };
  }

  private static async getCacheKey(query: ProductQuery): Promise<string> {
    return `products:${JSON.stringify(query)}`;
  }

  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const query: ProductQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || ProductsController.DEFAULT_PAGE_SIZE,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as 'price' | 'created_at' | 'name',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string
      };

      // Validate pagination params
      if (query.page < 1) query.page = 1;
      if (query.limit > 100) query.limit = 100;

      // Check cache first
      const cacheKey = await ProductsController.getCacheKey(query);
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return res.status(200).json(JSON.parse(cachedResult));
      }

      const filter = ProductsController.buildQuery(query);
      const sort = ProductsController.buildSort(query);
      
      const products = mongoClient.db.collection('products');
      
      // Execute queries in parallel
      const [results, total] = await Promise.all([
        products.find(filter)
          .sort(sort)
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .toArray(),
        products.countDocuments(filter)
      ]);

      const response: PaginatedResponse<Product> = {
        data: results,
        total,
        page: query.page,
        totalPages: Math.ceil(total / query.limit),
        hasMore: query.page * query.limit < total
      };

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(response), ProductsController.CACHE_TTL);

      return res.status(200).json(response);

    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProduct(req: Request, res: Response): Promise<Response> {
    try {
      const productId = req.params.id;
      
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const cacheKey = `product:${productId}`;
      const cachedProduct = await redisClient.get(cacheKey);
      
      if (cachedProduct) {
        return res.status(200).json(JSON.parse(cachedProduct));
      }

      const products = mongoClient.db.collection('products');
      const product = await products.findOne({ _id: new ObjectId(productId) });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await redisClient.set(cacheKey, JSON.stringify(product), ProductsController.CACHE_TTL);
      return res.status(200).json(product);

    } catch (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default ProductsController;
