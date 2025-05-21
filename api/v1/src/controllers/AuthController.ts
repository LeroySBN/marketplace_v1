import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthUser } from '../types/auth';
import mongoClient from '../utils/mongo';
import { hashPassword } from '../utils/auth';
import { CartItem } from '../types';
import { Product } from '../types';

class AuthController {
  static async signIn(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const users = mongoClient.db.collection('users');
      const user = await users.findOne<AuthUser>({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const hashedPassword = hashPassword(password);
      if (hashedPassword !== user.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(200).json({
        id: user._id,
        email: user.email,
        role: user.role
      });

    } catch (err) {
      console.error('Error during sign in:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async signUp(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const users = mongoClient.db.collection('users');
      const existingUser = await users.findOne<AuthUser>({ email });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const hashedPassword = hashPassword(password);
      let cart: CartItem[] = [];
      let products: Product[] = [];
      let list = role === 'vendor' ? products : cart;

      const result = await users.insertOne({
        name,
        email,
        password: hashedPassword,
        role,
        created_at: new Date(),
        updated_at: new Date(),
        list
      });

      return res.status(201).json({
        id: result.insertedId,
        email,
        role
      });

    } catch (err) {
      console.error('Error during sign up:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
