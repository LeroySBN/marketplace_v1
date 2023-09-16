import sha1 from 'sha1';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req: Request, res: Response): Promise<Response | void> {
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

    const users = await mongoClient.db.collection('users');

    users.findOne({ email, password }, (err: Error, user: any): any => {
      if (user) {
        const token = uuidv4();

        redisClient.set(`auth_${token}`, user._id.toString(), 86400);

        return res.status(200).json({ token });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
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
