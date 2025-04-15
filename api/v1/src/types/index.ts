import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  cart: CartItem[];
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  _id: ObjectId;
  productId: ObjectId;
  vendorId: ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dateCreated: string;
}

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

export interface Order {
  _id: ObjectId;
  userId: ObjectId;
  items: CartItem[];
  totalPrice: number;
  status: string;
  dateCreated: string;
}

export interface Delivery {
  _id: ObjectId;
  orderId: ObjectId;
  userId: ObjectId;
  vendorId: ObjectId;
  products: ProductDelivery[];
  status: string;
  dateCreated: string;
}

export interface ProductDelivery {
  productId: ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface Vendor {
  _id: ObjectId;
  name: string;
  email: string;
  products: Product[];
  created_at: Date;
  updated_at: Date;
}
