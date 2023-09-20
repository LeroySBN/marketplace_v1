import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import sha1 from 'sha1';
import { BaseObject } from './main';
import { Product } from './ProductsController';
import { OrderItem } from './OrdersController';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

interface Vendor extends BaseObject {
  email: string;
  password: string;
  name?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  location?: string;
  products?: Product[];
}

class VendorsController {
  static async postVendor(req: Request, res: Response): Promise<Response | void> {
    try {
      const {
        email,
        password,
        name = "",
        description = "",
        avatar = "",
        banner = "",
        location = "",
      } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
  
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }
  
      const vendor: Vendor = {
        _id: uuidv4(),
        dateCreated: new Date().toISOString(),
        email,
        password: sha1(password),
        name,
        description,
        avatar,
        banner,
        location,
        products: [],
      };
      
      const vendors = mongoClient.db.collection('vendors');
      
      const result = await vendors.findOne({email});
      
      if (result) {
        const authKey = Buffer.from(`${email}:${password}`).toString('base64');
        return res.status(400).json({ 
          error: `Already exists`,
          Authentication: `Basic ${authKey}`, // Remove this line in production
          result, // Remove this line in production
         });
      }

      await vendors.insertOne(vendor)
      .then(() => {
        return res.status(400).json(vendor);
      })
      .catch ((error: Error) => {
        return res.status(400).json({ error: error.message });
      })
      .finally(() => {
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMe(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const vendorId = await redisClient.get(`auth_${token}`);

      if (vendorId) {
        const vendors = mongoClient.db.collection('vendors');
        const vendor = await vendors.findOne({ _id: vendorId });
        if (vendor) {
          return res.status(200).json({ id: vendor._id, email: vendor.email });
        }
      }
      return res.status(401).json({ error: 'Unauthorized' });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async putVendorProduct(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const vendorId = await redisClient.get(`auth_${token}`);

      if (!vendorId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const vendors = mongoClient.db.collection('vendors');
      const vendor = await vendors.findOne({ _id: vendorId});

      if (vendor) {
        const { name, description, price, imageUrl, stock } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Missing name' });
        }
        if (!price) {
          return res.status(400).json({ error: 'Missing price' });
        }
        if (!Number.isInteger(price) || price < 1) {
          return res.status(400).json({ error: 'Price should be a positive integer' });
        }
        if (!stock) {
          return res.status(400).json({ error: 'Missing stock' });
        }
        if (!Number.isInteger(stock) || stock < 1) {
          return res.status(400).json({ error: 'Price should be a positive integer' });
        }

        const products = mongoClient.db.collection('products');

        const product: Product = {
          _id: uuidv4(),
          dateCreated: new Date().toISOString(),
          vendorId: vendor._id.toString(),
          name,
          description,
          price,
          imageUrl,
          stock,
        };

        await products.insertOne(product);

        vendors.updateOne({ _id: vendorId }, { $push: { products: product } })
        .then(() => {
          return res.status(200).json(product);
        })
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });      
    }
  }

  static async getVendorProducts(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const vendorId = await redisClient.get(`auth_${token}`);
      let page = parseInt(req.query.page as string, 10);

      if (!Number.isInteger(page) || page < 0) {
        page = 0;
      }
      
      if (!vendorId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const pageSize = 20;
      const skipCount = page * pageSize;
      const vendors = await mongoClient.db.collection('vendors');
      const vendor = await vendors.findOne({ _id: vendorId });
      
      if (vendor) {
        const products = mongoClient.db.collection('products');

        const vendorProducts = await products
        .aggregate([
          { $match: { vendorId } },
          { $skip: skipCount },
          { $limit: pageSize },
        ]).toArray();

        if (vendorProducts) {
          return res.status(200).json(vendorProducts);
        } else {
          return res.status(404).json({ error: 'Not found' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });      
    }
  }

  static async getVendorOrders(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const vendorId = await redisClient.get(`auth_${token}`);

      if (!vendorId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ message: 'Not implemented yet' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });      
    }
  }
}

export default VendorsController;
