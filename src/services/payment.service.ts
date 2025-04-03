import { PaymentMethod } from '../models/payment.model';
import { Order } from '../models/order.model';

export class PaymentService {
  private readonly PAYPAY_MAX_AMOUNT = 500000;
  private readonly AUPAY_MAX_AMOUNT = 300000;
  private readonly PAYMENT_METHODS = [
    PaymentMethod.CREDIT,
    PaymentMethod.PAYPAY,
    PaymentMethod.AUPAY,
  ];

  buildPaymentMethod(totalPrice: number): string {
    const availableMethods = this.PAYMENT_METHODS.filter((method) =>
      this.isPaymentMethodAvailable(method, totalPrice)
    );

    return availableMethods.join(',');
  }

  private isPaymentMethodAvailable(
    method: PaymentMethod,
    price: number
  ): boolean {
    if (method === PaymentMethod.PAYPAY) {
      return price <= this.PAYPAY_MAX_AMOUNT;
    }

    if (method === PaymentMethod.AUPAY) {
      return price <= this.AUPAY_MAX_AMOUNT;
    }

    return !!method;
  }

  async payViaLink(order: Order): Promise<void> {
    window.open(
      `https://payment.example.com/pay?orderId=${order.id}`,
      '_blank'
    );
  }
}
