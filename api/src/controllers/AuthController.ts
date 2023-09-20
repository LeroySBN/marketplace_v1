import sha1 from 'sha1';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req: Request, res: Response): Promise<Response | void> {
    try {
      const auth = req.header('Authorization')?.split(' ')[1];

      if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credentials = Buffer.from(auth, 'base64').toString('utf-8').split(':');

      if (credentials.length !== 2) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = credentials[0];
      const password = sha1(credentials[1]);

      const vendors = mongoClient.db.collection('vendors');
      const users = mongoClient.db.collection('users');

      const vendor = await vendors.findOne({ email, password });
      const user = await users.findOne({ email, password });

      if (vendor) {
        const token = uuidv4();

        redisClient.set(`auth_${token}`, vendor._id.toString(), 86400);

        return res.status(200).json({ token });
      } else if (user) {
        const token = uuidv4();

        redisClient.set(`auth_${token}`, user._id.toString(), 86400);

        return res.status(200).json({ token });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req: Request, res: Response): Promise<Response | void> {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
