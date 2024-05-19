interface BaseObject {
  readonly _id: string;
  readonly dateCreated: string;
  dateUpdated?: string;
}

export interface UserObj extends BaseObject {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  cart?: CartObj[];
}

export interface VendorObj extends BaseObject {
  email: string;
  password: string;
  name?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  location?: string;
  products?: ProductObj[];
}

export interface ProductObj extends BaseObject {
  vendorId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  category?: string;
}

export interface CartObj extends BaseObject {
  productId: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderObj extends BaseObject {
  userId: string;
  items: CartObj[];
  totalPrice: number;
  status: string; // 'pending' | 'paid' | 'cancelled'
}

export interface productDeliveryObj {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryObj extends BaseObject {
  orderId: string;
  vendorId: string;
  userId: string;
  products: productDeliveryObj[];
  status: string; // 'shipping' | 'delivered'
}
