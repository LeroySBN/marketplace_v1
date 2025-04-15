import { ObjectId } from 'mongodb';

export interface Product {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  stock: string;
  category: string;
  vendorId: ObjectId;
  created_at: Date;
  updated_at: Date;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'created_at' | 'name';
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
