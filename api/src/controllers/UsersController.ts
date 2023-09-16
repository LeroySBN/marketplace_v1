import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import sha1 from 'sha1';
import { BaseObject } from './main';
import mongoClient from '../utils/mongo';
import redisClient from '../utils/redis';
import { CartItem } from './CartController';

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

    users.findOne({ _id: new ObjectId(userId) }, (err: Error, user: User): any => {
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

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { cart } = req.body;

    if (!cart) {
      return res.status(400).json({ error: 'Missing cart' });
    }

    const users = await mongoClient.db.collection('users');

    users.findOne({ _id: new ObjectId(userId) }, (err: Error, user: User): any => {
      if (user) {
        users.updateOne({ _id: new ObjectId(userId) }, { $set: { cart } })
        .then(() => {
          return res.status(200).json(user);
        })
        .catch((error: Error) => {
          console.error(error);
          return res.status(400).json({ error: error.message });
        });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }
}

export default UsersController;
