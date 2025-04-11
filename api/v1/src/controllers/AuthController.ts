import sha1 from 'sha1';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthCredentials, TokenResponse, ErrorResponse, AuthUser } from '../types/auth';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';

class AuthController {
  private static readonly TOKEN_EXPIRY = 86400; // 24 hours

  private static async validateAuth(auth: string | undefined): Promise<AuthCredentials> {
    if (!auth) {
      throw new Error('Authorization header missing');
    }

    const credentials = Buffer.from(auth, 'base64').toString('utf-8').split(':');

    if (credentials.length !== 2) {
      throw new Error('Invalid credentials format');
    }

    return {
      email: credentials[0],
      password: sha1(credentials[1])
    };
  }

  private static async generateToken(userId: string): Promise<string> {
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, userId.toString(), AuthController.TOKEN_EXPIRY);
    return token;
  }

  static async getConnect(req: Request, res: Response): Promise<Response> {
    try {
      const auth = req.header('Authorization')?.split(' ')[1];
      const credentials = await AuthController.validateAuth(auth);

      const collections = {
        vendors: mongoClient.db.collection('vendors'),
        users: mongoClient.db.collection('users')
      };

      const [vendor, user] = await Promise.all([
        collections.vendors.findOne({ email: credentials.email, password: credentials.password }) as Promise<AuthUser>,
        collections.users.findOne({ email: credentials.email, password: credentials.password }) as Promise<AuthUser>
      ]);

      const authenticatedUser = vendor || user;
      if (!authenticatedUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = await AuthController.generateToken(authenticatedUser._id.toString());
      return res.status(200).json({ token });

    } catch (err) {
      console.error('Authentication error:', err);
      const error = err instanceof Error ? err.message : 'Internal server error';
      return res.status(err instanceof Error ? 401 : 500).json({ error });
    }
  }

  static async getDisconnect(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Token missing' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      await redisClient.del(`auth_${token}`);
      return res.status(204).send();

    } catch (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
