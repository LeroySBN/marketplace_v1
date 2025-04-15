import { Request, Response } from 'express';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

class AppController {
  static async getHealth(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'marketplace-api',
      version: '1.0.0'
    });
  }

  static async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const redisStatus = await redisClient.ping();
      const mongoStatus = await mongoClient.isConnected();

      return res.status(200).json({
        redis: redisStatus === 'PONG',
        mongodb: mongoStatus
      });
    } catch (err) {
      console.error('Error getting status:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const [users, vendors, products, orders] = await Promise.all([
        mongoClient.db.collection('users').countDocuments(),
        mongoClient.db.collection('vendors').countDocuments(),
        mongoClient.db.collection('products').countDocuments(),
        mongoClient.db.collection('orders').countDocuments()
      ]);

      return res.status(200).json({
        users,
        vendors,
        products,
        orders
      });
    } catch (err) {
      console.error('Error getting stats:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AppController;
