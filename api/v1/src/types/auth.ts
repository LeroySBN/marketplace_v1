import { ObjectId } from 'mongodb';
import { CartItem, Product } from './index';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}

export interface AuthUser {
  _id: ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'buyer' | 'vendor';
  created_at: Date;
  updated_at: Date;
}
