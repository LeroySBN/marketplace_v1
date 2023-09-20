import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';

import { VendorObj, ProductObj } from './main';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';


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
  
      const vendor: VendorObj = {
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

      if (vendorId) {
        const vendors = mongoClient.db.collection('vendors');
        const vendor = await vendors.findOne({ _id: vendorId});
  
        if (vendor) {
          const { name, description, price, imageUrl, stock, productId, location, banner } = req.body;
          
          if (!stock) {
            return res.status(400).json({ error: 'Missing stock' });
          }
          if (!Number.isInteger(stock) || stock < 1) {
            return res.status(400).json({ error: 'Price should be a positive integer' });
          }

          if (productId && (stock || price || imageUrl || description || name || location)) {
            const product = await mongoClient.db.collection('products').findOne({ _id: productId });

            if (product) {
              await vendor.products.map((product: ProductObj) => {
                if (product._id === productId) {
                  product.name = name || product.name;
                  product.price = price || product.price;
                  product.stock = stock || product.stock;
                  product.imageUrl = imageUrl || product.imageUrl;
                  product.description = description || product.description;
                }
              });
              
              await vendors.updateOne({ _id: vendorId }, { $set: { products: vendor.products } });
              console.log({ suucess: "Vendor's product list updated" });
              

              const products = mongoClient.db.collection('products');

              const updatedProduct = await products.updateOne({ _id: productId }, { $set: {
                name: name || product.name,
                price: price || product.price,
                stock : stock || product.stock,
                imageUrl : imageUrl || product.imageUrl,
                description: description || product.description,
              }});

              const result = await products.findOne({ _id: productId });

              return res.status(200).json(result);
            } else {
              return res.status(404).json({ error: 'Not found' });
            }
          }

          if (!name) {
            return res.status(400).json({ error: 'Missing name' });
          }
          if (!price) {
            return res.status(400).json({ error: 'Missing price' });
          }
          if (!Number.isInteger(price) || price < 1) {
            return res.status(400).json({ error: 'Price should be a positive integer' });
          }
  
          const product: ProductObj = {
            _id: uuidv4(),
            dateCreated: new Date().toISOString(),
            vendorId: vendor._id.toString(),
            name,
            description,
            price,
            imageUrl,
            stock,
          };
  
          await mongoClient.db.collection('products').insertOne(product);
  
          vendors.updateOne({ _id: vendorId }, { $push: { products: product } })
          .then(() => {
            return res.status(200).json(product);
          })
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
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
      
      if (vendorId) {
        const pageSize = 20;
        const skipCount = page * pageSize;
        const vendors = await mongoClient.db.collection('vendors');
        const vendor = await vendors.findOne({ _id: vendorId });
        
        if (vendor) {
          const products = vendor.products.slice(skipCount, skipCount + pageSize);
          return res.status(200).json(products);
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
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

      if (vendorId) {
        const vendor = await mongoClient.db.collection('vendors').findOne({ _id: vendorId });
  
        if (vendor) {
          const deliveries = await mongoClient.db.collection('deliveries').find({ vendorId }).toArray();
    
          if (deliveries) {
            return res.status(200).json({
              count: deliveries.length,
              deliveries,
            });
          } else {
            return res.status(404).json({ error: 'No orders' });
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default VendorsController;
