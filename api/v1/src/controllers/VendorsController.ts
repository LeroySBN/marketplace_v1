import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { User, Product } from '../types';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';
import { hashPassword } from '../utils/auth';

class VendorsController {
  static async getVendor(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }

      const vendors = mongoClient.db.collection<User>('users');
      const vendor = await vendors.findOne({ _id: new ObjectId(id) });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      return res.status(200).json(vendor);

    } catch (err) {
      console.error('Error getting vendor:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateVendor(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updates = req.body as {
        name?: string;
        email?: string;
        password?: string;
      };

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }

      if (updates.password) {
        await redisClient.set(`vendor_${updates.email}`, await hashPassword(updates.password), 86400); // 24 hours TTL
        delete updates.password;
      }

      const vendors = mongoClient.db.collection<User>('users');
      const result = await vendors.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updated_at: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      return res.status(200).json({ message: 'Vendor updated successfully' });

    } catch (err) {
      console.error('Error updating vendor:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteVendor(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }

      const vendors = mongoClient.db.collection<User>('users');
      const vendor = await vendors.findOne({ _id: new ObjectId(id) });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      // Delete vendor's products
      const products = mongoClient.db.collection<Product>('products');
      await products.deleteMany({ vendorId: new ObjectId(id) });

      // Delete vendor
      await vendors.deleteOne({ _id: new ObjectId(id) });

      // Delete vendor's password from Redis
      await redisClient.del(`vendor_${vendor.email}`);

      return res.status(200).json({ message: 'Vendor deleted successfully' });

    } catch (err) {
      console.error('Error deleting vendor:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getVendorProducts(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      const sort = req.query.sort as string || 'name';
      const order = req.query.order as string || 'asc';

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }

      const products = mongoClient.db.collection<Product>('products');
      const [items, total] = await Promise.all([
        products.find({ vendorId: new ObjectId(id) })
          .sort({ [sort]: order === 'asc' ? 1 : -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        products.countDocuments({ vendorId: new ObjectId(id) })
      ]);

      return res.status(200).json({
        data: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      });

    } catch (err) {
      console.error('Error getting vendor products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addVendorProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, price, description, category, stock } = req.body as {
        name: string;
        price: number;
        description: string;
        category: string;
        stock: string | number;
      };

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }

      if (!name || !price || !description || !category || !stock) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const vendors = mongoClient.db.collection<User>('users');
      const vendor = await vendors.findOne({ _id: new ObjectId(id) });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      const products = mongoClient.db.collection<Product>('products');
      const product = {
        _id: new ObjectId(),
        name,
        description,
        price: Number(price),
        stock: stock.toString(),
        category,
        vendorId: new ObjectId(id),
        created_at: new Date(),
        updated_at: new Date()
      } satisfies Product;

      await products.insertOne(product);

      return res.status(201).json(product);

    } catch (err) {
      console.error('Error adding vendor product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async removeVendorProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { id, productId } = req.params;

      if (!ObjectId.isValid(id) || !ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid vendor or product ID' });
      }

      const vendors = mongoClient.db.collection<User>('users');
      const vendor = await vendors.findOne({ _id: new ObjectId(id) });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      const products = mongoClient.db.collection<Product>('products');
      const product = await products.findOne({
        _id: new ObjectId(productId),
        vendorId: new ObjectId(id)
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await products.deleteOne({ _id: new ObjectId(productId) });

      return res.status(200).json({ message: 'Product removed successfully' });

    } catch (err) {
      console.error('Error removing vendor product:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default VendorsController;
