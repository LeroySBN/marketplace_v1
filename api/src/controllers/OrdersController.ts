import { BaseObject } from './main';
import { CartItem } from './CartController';

export interface OrderItem extends BaseObject {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: string; // 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
}
