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
    const users = await mongoClient.nbUsers();
    const vendors = await mongoClient.nbVendors();
    const products = await mongoClient.nbProducts();
    const status = {
      users,
      vendors,
      products,
    };
    return res.status(200).json(status);
  }
}

export default AppController;
