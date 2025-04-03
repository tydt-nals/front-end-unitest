export interface OrderItem {
  id: string;
  productId: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  totalPrice: number;
  items: OrderItem[];
  couponId?: string;
  paymentMethod: string;
}

export interface Coupon {
  discount: number;
}
