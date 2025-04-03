import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';

import { Order } from '../../models/order.model';
import { PaymentMethod } from '../../models/payment.model';
import { PaymentService } from '../payment.service';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let windowSpy: MockInstance;

  beforeEach(() => {
    paymentService = new PaymentService();
    windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  describe('#buildPaymentMethod', () => {
    it('should return all payment methods for amounts < 300,000', () => {
      const result = paymentService.buildPaymentMethod(100000);

      expect(result).toBe(
        [PaymentMethod.CREDIT, PaymentMethod.PAYPAY, PaymentMethod.AUPAY].join(',')
      );
    });

    it('should return CREDIT and PAYPAY for amounts >= 300,000 and <= 500,000', () => {
      const result = paymentService.buildPaymentMethod(400000);

      expect(result).toBe(
        [PaymentMethod.CREDIT, PaymentMethod.PAYPAY].join(',')
      );
    });

    it('should return only CREDIT for amounts > 500,000', () => {
      const result = paymentService.buildPaymentMethod(600000);

      expect(result).toBe(PaymentMethod.CREDIT);
    });

    it('should handle edge case when amount is exactly 300,000', () => {
      const result = paymentService.buildPaymentMethod(300000);

      expect(result).toBe(
        [PaymentMethod.CREDIT, PaymentMethod.PAYPAY, PaymentMethod.AUPAY].join(',')
      );
    });

    it('should handle edge case when amount is exactly 500,000', () => {
      const result = paymentService.buildPaymentMethod(500000);

      expect(result).toBe(
        [PaymentMethod.CREDIT, PaymentMethod.PAYPAY].join(',')
      );
    });
  });

  describe('#payViaLink', () => {
    it('should open payment link in a new window', async () => {
      const mockOrder: Order = {
        id: '123',
        items: [],
        totalPrice: 1000,
        paymentMethod: PaymentMethod.CREDIT,
      };

      await paymentService.payViaLink(mockOrder);

      expect(windowSpy).toHaveBeenCalledWith(
        'https://payment.example.com/pay?orderId=123',
        '_blank'
      );
    });
  });
});
