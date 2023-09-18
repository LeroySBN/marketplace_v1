import { BaseObject } from './main';

export interface CartItem extends BaseObject {
  productId: string;
  quantity: number;
  totalPrice: number;
}
