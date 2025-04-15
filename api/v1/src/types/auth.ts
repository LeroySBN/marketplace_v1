import { ObjectId } from 'mongodb';

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
  role: 'admin' | 'customer' | 'vendor';
  created_at: Date;
}
