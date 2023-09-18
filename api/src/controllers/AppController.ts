import { Request, Response } from 'express';
import redisClient from '../utils/redis';
import mongoClient from '../utils/mongo';

class AppController {
  static getStatus(req: Request, res: Response): Response {
    const status = {
      redis: redisClient.isAlive(),
      mongodb: mongoClient.isAlive(),
    };
    return res.status(200).json(status);
  }

  static async getStats(req: Request, res: Response): Promise<Response | void> {
    const vendors = await mongoClient.nbVendors();
    const products = await mongoClient.nbProducts();
    const users = await mongoClient.nbUsers();
    const orders = await mongoClient.nbOrders();
    const status = {
      users,
      vendors,
      products,
      orders,
    };
    return res.status(200).json(status);
  }
}

export default AppController;
