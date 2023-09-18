import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import sha1 from "sha1";
import { BaseObject } from "./main";
import mongoClient from "../utils/mongo";
import redisClient from "../utils/redis";
import { Product } from "./ProductsController";
import { OrderItem } from "./OrdersController";

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
    const { name, email, password, description, avatar, banner, location } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const vendor: Vendor = {
      id: uuidv4(),
      dateCreated: new Date().toISOString(),
      email,
      password: sha1(password),
      name,
      description,
      avatar,
      banner,
      location,
    };

    const vendors = await mongoClient.db.collection('vendors');

    vendors.findOne({ email: vendor.email }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        return res.status(400).json({ error: 'Already exists' });
      } else {
        vendors.insertOne(vendor)
        .then(() => {
          return res.status(201).json(vendor);
        })
        .catch((error: Error) => {
          console.error(error);
          return res.status(400).json({ error: error.message });
        });
      }
    });
  }

  static async getMe(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const vendorId = await redisClient.get(`auth_${token}`);

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vendors = await mongoClient.db.collection('vendors');

    vendors.findOne({ id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        return res.status(200).json(vendor);
      } else {
        return res.status(404).json({ error: 'Not found' });
      }
    });
  }

  static async putVendorProduct(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const vendorId = await redisClient.get(`auth_${token}`);

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vendors = await mongoClient.db.collection('vendors');

    vendors.findOne({ id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        const { name, description, price, imageUrl, stock } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Missing name' });
        }
        if (!price) {
          return res.status(400).json({ error: 'Missing price' });
        }
        if (!stock) {
          return res.status(400).json({ error: 'Missing stock' });
        }

        const vendorId = vendor.id.toString();
        const products = mongoClient.db.collection('products');

        const product: Product = {
          id: uuidv4(),
          dateCreated: new Date().toISOString(),
          vendorId,
          name,
          description,
          price,
          imageUrl,
          stock,
        };

        products.insertOne(product);

        vendors.updateOne({ id: new ObjectId(vendorId) }, { $push: { products: product } })
        .then(() => {
          return res.status(200).json(product);
        })
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getVendorProducts(req: Request, res: Response): Promise<Response | void> {
    // get vendor id from token in header and find vendor in db
    // if vendor is found, get page in request query list products with 10 per page
    // if vendor is not found, return 401 unauthorized
    const token = req.header('X-Token');
    const vendorId = await redisClient.get(`auth_${token}`);
    const page: number = parseInt(req.query.page as string, 10);
    const pageSize: number = 10;
    const skip: number = (page - 1) * pageSize;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vendors = await mongoClient.db.collection('vendors');

    vendors.findOne({ id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        const products = mongoClient.db.collection('products');

        products.find({ vendorId: vendor.id.toString() }).skip(skip).limit(pageSize).toArray((err: Error, products: Product[]): any => {
          if (products) {
            return res.status(200).json(products);
          } else {
            return res.status(404).json({ error: 'Not found' });
          }
        });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getVendorOrders(req: Request, res: Response): Promise<Response | void> {
    // get vendor id from token in header and find vendor in db
    // if vendor is found, get page in request query list orders with 10 per page
    // if vendor is not found, return 401 unauthorized
    const token = req.header('X-Token');
    const vendorId = await redisClient.get(`auth_${token}`);
    const page: number = parseInt(req.query.page as string, 10);
    const pageSize: number = 10;
    const skip: number = (page - 1) * pageSize;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const vendors = await mongoClient.db.collection('vendors');

    vendors.findOne({ id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        const orders = mongoClient.db.collection('orders');

        orders.find({ vendorId: vendor.id.toString() }).skip(skip).limit(pageSize).toArray((err: Error, orders: OrderItem[]): any => {
          if (orders) {
            return res.status(200).json(orders);
          } else {
            return res.status(404).json({ error: 'Not found' });
          }
        });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }
}

export default VendorsController;
