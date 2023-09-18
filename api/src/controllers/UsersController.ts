import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import sha1 from 'sha1';
import { BaseObject } from './main';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';
import { CartItem } from './CartController';
import { Product } from './ProductsController';
import { OrderItem } from './OrdersController';

export interface User extends BaseObject {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  cart?: CartItem[];
}

class UsersController {
  static async postUser(req: Request, res: Response): Promise<Response | void> {
    const { email, password, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user: User = {
      id: uuidv4(),
      dateCreated: new Date().toISOString(),
      email,
      password: sha1(password),
      firstName,
      lastName,
    };

    const users = await mongoClient.db.collection('users');

    users.findOne({ email: user.email }, (err: Error, user: User): any => {
      if (user) {
        return res.status(400).json({ error: 'Already exists' });
      } else {
        users.insertOne(user)
        .then(() => {
          return res.status(201).json(user);
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
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ error: 'Not found' });
      }
    });
  }

  static async putUserCart(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (quantity < 1 && !Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }
      // if product id and quantity are provided, add to cart or update quantity
      if (productId && quantity) {
        const product = mongoClient.db.collection('products').findOne({ id: new ObjectId(productId) });
        // check if product exists
        if (!product) {
          return res.status(404).json({ error: 'Product not available' });
        }
        if (product.stock === 0) {
          return res.status(400).json({ error: 'Product out of stock' });
        }
        // check if quantity is available
        if (quantity > product.stock) {
          const remainingStock = product.stock;
          return res.status(400).json({ error: `Quantity not available: ${remainingStock} left` });
        }
        if (quantity <= product.stock) {
          const cartItem: CartItem = {
            id: uuidv4(),
            dateCreated: new Date().toISOString(),
            productId,
            quantity,
            totalPrice: product.price * quantity,
          };
          // check if product already in cart. if so, update quantity else add to cart
          const cart = user.cart;
          if (cart) {
            const productInCart = cart.find((item) => item.productId === productId);
            if (productInCart) {
              productInCart.quantity = quantity;
            } else {
              cart.push(cartItem);
            }
            return res.status(200).json(cart);
          }
        }
      }
    });
  }

  static async deleteUserCartItem(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!productId) {
        return res.status(400).json({ error: 'Missing productId' });
      }
      // check if product id exists in cart
      const cart = user.cart;
      if (cart) {
        const productInCart = cart.find((item) => item.productId === productId);
        if (productInCart) {
          cart.splice(cart.indexOf(productInCart), 1);
          return res.status(200).json(cart);
        } else {
          return res.status(400).json({ error: 'Product not in cart' });
        }
      }
    });
  }

  static async getUserCheckout(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const cart = user.cart;
      if (cart) {
        const products = mongoClient.db.collection('products');
        const productsInCart = cart.map((item) => item.productId);
        products.find({ id: { $in: productsInCart } }).toArray((err: Error, products: Product[]): any => {
          if (products) {
            const checkout = products.map((product) => {
              const productInCart = cart.find((item) => item.productId === product.id);
              return {
                productId: product.id,
                name: product.name,
                quantity: productInCart?.quantity,
                unitPrice: product.price,
              };
            });
            return res.status(200).json(checkout);
          } else {
            return res.status(404).json({ error: 'Products not found' });
          }
        });
      } else {
        return res.status(404).json({ error: 'Cart is empty' });
      }
    });
  }

  static async postUserOrder(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const { order } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (order !== 1 && order !== 0) {
        return res.status(400).json({ error: 'Order must be 1 to order otherwise 0' });
      }

      if (order === 1) {
        const cart = user.cart;

        if (cart) {
          const products = mongoClient.db.collection('products');
          const productsInCart = cart.map((item) => item.productId);
          products.find({ id: { $in: productsInCart } }).toArray((err: Error, products: Product[]): any => {
            if (products) {
              const productsOutOfStock = products.filter((product) => product.stock === 0);

              if (productsOutOfStock.length > 0) {
                return res.status(400).json({ error: 'Some products are out of stock' });
              }

              const productsInStock = products.filter((product) => product.stock > 0);

              if (productsInStock.length > 0) {
                productsInStock.forEach((product) => {
                  const productInCart = cart.find((item) => item.productId === product.id);
                  if (productInCart) {
                    product.stock -= productInCart.quantity;
                  }
                });
              }

              const orders = mongoClient.db.collection('orders');

              const order: OrderItem = {
                id: uuidv4(),
                dateCreated: new Date().toISOString(),
                userId,
                status: 'pending',
                totalPrice: cart.reduce((acc, item) => acc + item.totalPrice, 0),
                items: cart,
              };

              orders.insertOne(order)
              .then(() => {
                return res.status(201).json(order);
              })
              .catch((error: Error) => {
                console.error(error);
                return res.status(400).json({ error: error.message });
              });
            } else {
              return res.status(404).json({ error: 'Products not found' });
            }
          });
        } else {
          return res.status(404).json({ error: 'Cart is empty' });
        }
      }
    });
  }

  static async getUserOrders(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const orders = mongoClient.db.collection('orders');

      orders.find({ userId }).toArray((err: Error, orders: OrderItem[]): any => {
        if (orders) {
          return res.status(200).json(orders);
        } else {
          return res.status(404).json({ error: 'Orders not found' });
        }
      });
    });
  }
}

export default UsersController;
