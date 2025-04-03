import { Coupon, Order } from '../models/order.model';
import { HttpClient } from './http.service';
import { PaymentService } from './payment.service';

export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly httpClient: HttpClient
  ) { }

  async process(order: Partial<Order>) {
    const totalPrice = await this.calculateTotalPrice(order);
    const paymentMethod = this.paymentService.buildPaymentMethod(totalPrice);
    const orderPayload = {
      ...order,
      totalPrice,
      paymentMethod,
    };

    const createdOrder = await this.createOrder(orderPayload);

    this.paymentService.payViaLink(createdOrder);
  }

  private async calculateTotalPrice(order: Partial<Order>): Promise<number> {
    const orderItems = order.items || [];
    if (!orderItems.length) {
      throw new Error('Order items are required');
    }

    if (orderItems.some((item) => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }

    const totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    if (!order.couponId) return totalPrice;

    const coupon = await this.fetchCoupon(order.couponId);
    if (!coupon) {
      throw new Error('Failed to fetch coupon');
    }

    return Math.max(totalPrice - coupon.discount, 0);
  }

  private async fetchCoupon(couponId: string): Promise<Coupon | null> {
    try {
      const coupon = await this.httpClient.get<Coupon>(
        `https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/${couponId}`
      );

      return coupon ?? null;
    } catch {
      return null;
    }
  }

  private async createOrder(orderPayload: Partial<Order>): Promise<Order> {
    try {
      return await this.httpClient.post<Order>(
        'https://67eb7353aa794fb3222a4c0e.mockapi.io/order',
        orderPayload
      );
    } catch {
      throw new Error('Failed to create order');
    }
  }
}
