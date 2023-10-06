import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';

import { UserObj, VendorObj, ProductObj, CartObj, OrderObj, productDeliveryObj, DeliveryObj } from './main';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';


class UsersController {
  static async postUser(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const user: UserObj = {
        _id: uuidv4(),
        dateCreated: new Date().toISOString(),
        email,
        password: sha1(password),
        firstName,
        lastName,
        cart: [],
        
      };

      const users = mongoClient.db.collection('users');
      const result = await users.findOne({email}) ;

      if (result) {
        return res.status(400).json({ error: `Already exists` });
      }

      await users.insertOne(user)
      .then(() => {
        return res.status(201).json(user);
      })
      .catch((error: Error) => {
        console.error(error);
        return res.status(400).json({ error: error.message });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMe(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (userId) {
        const users = mongoClient.db.collection('users');
        const user = await users.findOne({ _id: userId });
        if (user) {
          return res.status(200).json({ id: user._id, email: user.email, cart: user.cart });
        }
      }
      return res.status(401).json({ error: 'Unauthorized' });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async putUserCart(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const user =  await mongoClient.db.collection('users').findOne({ _id: userId });
      
      if (user) {
        const { productId, quantity } = req.body;
        
        if (!productId) {
          return res.status(400).json({ error: 'Missing productId' });
        }

        if (!quantity) {
          return res.status(400).json({ error: 'Missing quantity' });
        }
        
        if (!Number.isInteger(quantity) || quantity < 1) {
          return res.status(400).json({ error: 'Quantity should be a positive integer' });
        }
        
        const product = await mongoClient.db.collection('products').findOne({ _id: productId });
        console.log(product);
        
        if (!product) {
          return res.status(404).json({ error: 'Product not available' });
        }

        if (product.stock === 0) {
          return res.status(400).json({ error: 'Product out of stock' });
        }

        if (quantity > product.stock) {
          const remainingStock = product.stock;
          return res.status(400).json({ error: `${remainingStock} available` });
        }

        if (quantity <= product.stock) {
          const cartItem: CartObj = {
            _id: uuidv4(),
            dateCreated: new Date().toISOString(),
            productId,
            vendorId: product.vendorId,
            quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
          };

          // check if product already in cart. if so, update quantity else add to cart
          const productInCart = user.cart.find((item: CartObj) => item.productId === productId);
          if (productInCart) {
            console.log('productInCart');
            await user.cart.forEach((item: CartObj) => {
              if (item.productId === productId) {
                item.quantity = quantity;
                item.totalPrice = product.price * quantity;
              }
            });
          } else {
            await user.cart.push(cartItem);
          }
          await mongoClient.db.collection('users').updateOne({ _id: userId }, { $set: { cart: user.cart } });
          return res.status(200).json(cartItem);
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteUserCartItem(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await mongoClient.db.collection('users').findOne({ _id: userId });
      
      if (user) {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({ error: 'Missing productId' });
        }

        const product = await mongoClient.db.collection('products').findOne({ _id: productId });

        if (!product) {
          return res.status(404).json({ error: 'Product does not exist' });
        }

        // check if product id exists in cart
        const productInCart = user.cart.find((item: CartObj) => item.productId === productId);
        if (productInCart) {
          user.cart.splice(user.cart.indexOf(productInCart), 1);
          await mongoClient.db.collection('users').updateOne({ _id: userId }, { $set: { cart: user.cart } });
          return res.status(200).json(user.cart);
        } else {
          return res.status(400).json({ error: 'Product not in cart' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getUserCheckout(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (userId) {
        const user = await mongoClient.db.collection('users').findOne({ _id: userId });
  
        if (user) {
          const cart = user.cart;
          if (cart) {
            return res.status(200).json(cart);
          } else {
            return res.status(404).json({ error: 'Cart is empty' });
          }
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }


    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async postUserOrder(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      
      if (userId) {
        const user = await mongoClient.db.collection('users').findOne({ _id: userId });

        if (user) {
          if (user.cart.length > 0) {
            const productsInCart = user.cart.map((item: CartObj) => item.productId);
            const products = await mongoClient.db.collection('products').find({ _id: { $in: productsInCart } }).toArray();;

            if (products) {
              const productsOutOfStock = products.filter((product: ProductObj) => product.stock < 1);

              if (productsOutOfStock.length == 0) {

                // save new order
                const order: OrderObj = {
                  _id: uuidv4(),
                  dateCreated: new Date().toISOString(),
                  userId,
                  status: 'pending',
                  totalPrice: user.cart.reduce((acc: number, item: CartObj) => acc + item.totalPrice, 0),
                  items: user.cart,
                };
  
                await mongoClient.db.collection('orders').insertOne(order)
                .then(() => {
                  console.log('Order created');
                });
  
                // save delivery
                const deliveries: DeliveryObj[] = [];
                // get unique vendor ids, then create delivery for each vendor, each containing the products for that vendor
                const vendorIds = user.cart.map((item: CartObj) => item.vendorId);
                const uniqueVendorIds = [...new Set(vendorIds)];

                uniqueVendorIds.forEach((vendorId: any) => {
                  const productDelivery: Array<productDeliveryObj> = [];
                  const items = user.cart.filter((item: CartObj) => item.vendorId === vendorId);

                  items.forEach((item: CartObj) => {
                    productDelivery.push({
                      productId: item.productId,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                    });
                  });

                  const delivery: DeliveryObj = {
                    _id: uuidv4(),
                    dateCreated: new Date().toISOString(),
                    orderId: order._id,
                    userId,
                    vendorId,
                    products: productDelivery,
                    status: 'shipping',
                  };
                  deliveries.push(delivery);
                });             

                await mongoClient.db.collection('deliveries').insertMany(deliveries)
                .then(() => {
                  console.log('Delivery created');
                });
                
                // update product stock
                const productIds = user.cart.map((item: CartObj) => item.productId);
                const productsToUpdate = await mongoClient.db.collection('products').find({ _id: { $in: productIds } }).toArray();

                await Promise.all(
                  productsToUpdate.map(async (product: ProductObj) => {
                    const productInCart = user.cart.find((item: CartObj) => item.productId === product._id);
                    if (productInCart) {
                      product.stock -= productInCart.quantity;
                      await mongoClient.db.collection('products').updateOne({ _id: product._id }, { $set: { stock: product.stock } });
                    }
                  })
                )
                .then(() => {
                  console.log('Products updated');
                });

                // update vendor products
                const vendorIdsToUpdate = user.cart.map((item: CartObj) => item.vendorId);
                const vendorsToUpdate = await mongoClient.db.collection('vendors').find({ _id: { $in: vendorIdsToUpdate } }).toArray();

                await Promise.all(
                  vendorsToUpdate.map(async (vendor: VendorObj | any) => {
                    const vendorProductsToUpdate = user.cart.filter((item: CartObj) => item.vendorId === vendor._id);
                    await Promise.all(
                      vendorProductsToUpdate.map(async (item: CartObj) => {
                        const products = vendor.products;
                        const product = products.find((product: ProductObj) => product._id === item.productId);
                        if (product) {
                          product.stock -= item.quantity;
                          await mongoClient.db.collection('vendors').updateOne({ _id: vendor._id }, { $set: { products: vendor.products } });
                        }
                      })
                    );
                  })
                )
                .then(() => {
                  console.log('Vendor products updated');
                });
                
                // clear cart
                await mongoClient.db.collection('users').updateOne({ _id: userId }, { $set: { cart: [] } })
                .then(() => {
                  console.log('Cart cleared');
                });

                return res.status(201).json(order);
                
              } else {
                const productsOutOfStockNames = productsOutOfStock.map((product: ProductObj) => product.name);
                return res.status(400).json({ error: `Products out of stock: ${productsOutOfStockNames.join(', ')}` });
              }
            } else {
              return res.status(404).json({ error: 'Products not found' });
            }
          } else {
            return res.status(404).json({ error: 'Cart is empty' });
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

  static async getUserOrders(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);

      if (userId) {
        const user = await mongoClient.db.collection('users').findOne({ _id: userId });
  
        if (user) {
          const orders = await mongoClient.db.collection('orders').find({ userId }).toArray();
    
          if (orders) {
            return res.status(200).json({
              count: orders.length,
              orders
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

export default UsersController;
