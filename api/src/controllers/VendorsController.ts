import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import sha1 from "sha1";
import { BaseObject } from "./main";
import mongoClient from "../utils/mongo";
import redisClient from "../utils/redis";
import { Product } from "./ProductsController";

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

    vendors.findOne({ _id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
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

    vendors.findOne({ _id: new ObjectId(vendorId) }, (err: Error, vendor: Vendor): any => {
      if (vendor) {
        const { name, description, price, imageUrl, quantity } = req.body;
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
          quantity,
        };

        products.insertOne(product);

        vendors.updateOne({ _id: new ObjectId(vendorId) }, { $push: { products: product } })
        .then(() => {
          return res.status(200).json(product);
        })
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }
}

export default VendorsController;
