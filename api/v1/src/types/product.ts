export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  vendor_id: string;
  stock: number;
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
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
