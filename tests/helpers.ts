import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoClient from '../api/v1/src/utils/mongo';

export const mockRequest = (options: any = {}): Partial<Request> => ({
  header: jest.fn().mockImplementation((name: string) => options.headers?.[name]),
  query: options.query || {},
  params: options.params || {},
  body: options.body || {},
});

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createTestUser = async (userData: any = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', // "password" in sha1
    name: 'Test User',
    created_at: new Date(),
  };

  const users = mongoClient.db.collection('users');
  const result = await users.insertOne({
    ...defaultUser,
    ...userData,
  });
  return result;
};

export const createTestProduct = async (productData: any = {}) => {
  const defaultProduct = {
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'test-category',
    vendor_id: new ObjectId(),
    stock: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const products = mongoClient.db.collection('products');
  const result = await products.insertOne({
    ...defaultProduct,
    ...productData,
  });
  return result;
};
