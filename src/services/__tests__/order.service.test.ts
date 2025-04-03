import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { Order } from '../../models/order.model';
import { HttpClient } from '../http.service';
import { OrderService } from '../order.service';
import { PaymentService } from '../payment.service';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockPaymentService: {
    buildPaymentMethod: Mock;
    payViaLink: Mock;
  };
  let mockHttpClient: Record<keyof HttpClient, Mock>;

  beforeEach(() => {
    mockPaymentService = {
      buildPaymentMethod: vi.fn(),
      payViaLink: vi.fn(),
    };

    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
    };

    orderService = new OrderService(
      mockPaymentService as unknown as PaymentService,
      mockHttpClient as unknown as HttpClient
    );
  });

  describe('#process', () => {
    const validOrder: Partial<Order> = {
      items: [
        {
          id: '1',
          productId: 'product1',
          price: 100,
          quantity: 2,
        },
        {
          id: '2',
          productId: 'product2',
          price: 200,
          quantity: 1,
        },
      ],
    };

    it('should process order successfully without coupon', async () => {
      const expectedTotalPrice = 400;
      mockPaymentService.buildPaymentMethod.mockReturnValue('CREDIT');
      mockHttpClient.post.mockResolvedValue({ ...validOrder, id: '123' });

      await orderService.process(validOrder);

      expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(
        expectedTotalPrice
      );
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          items: validOrder.items,
          totalPrice: expectedTotalPrice,
          paymentMethod: 'CREDIT',
        })
      );
      expect(mockPaymentService.payViaLink).toHaveBeenCalled();
    });

    it('should process order successfully with valid coupon', async () => {
      const orderWithCoupon = { ...validOrder, couponId: 'COUPON123' };
      mockHttpClient.get.mockResolvedValue({ discount: 100 });
      mockPaymentService.buildPaymentMethod.mockReturnValue('CREDIT');
      mockHttpClient.post.mockResolvedValue({ ...orderWithCoupon, id: '123' });

      await orderService.process(orderWithCoupon);

      expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(300);
      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('#calculateTotalPrice', () => {
    it('should throw error for undefined items', async () => {
      const invalidOrder: Partial<Order> = {};

      await expect(orderService.process(invalidOrder)).rejects.toThrow(
        'Order items are required'
      );
    });

    it('should throw error for empty items', async () => {
      const invalidOrder: Partial<Order> = { items: [] };

      await expect(orderService.process(invalidOrder)).rejects.toThrow(
        'Order items are required'
      );
    });

    it('should throw error for invalid item price', async () => {
      const invalidOrder: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 0,
            quantity: 1,
          },
        ],
      };

      await expect(orderService.process(invalidOrder)).rejects.toThrow(
        'Order items are invalid'
      );
    });

    it('should throw error for invalid item quantity', async () => {
      const invalidOrder: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: -1,
          },
        ],
      };

      await expect(orderService.process(invalidOrder)).rejects.toThrow(
        'Order items are invalid'
      );
    });

    it('should throw error for invalid coupon', async () => {
      const orderWithInvalidCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'INVALID',
      };
      mockHttpClient.get.mockRejectedValue(new Error());

      await expect(
        orderService.process(orderWithInvalidCoupon)
      ).rejects.toThrow('Failed to fetch coupon');
    });

    it('should throw error for null coupon', async () => {
      const orderWithNullCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'NULL_COUPON',
      };

      mockHttpClient.get.mockResolvedValue(null);

      await expect(orderService.process(orderWithNullCoupon)).rejects.toThrow(
        'Failed to fetch coupon'
      );
    });

    it('should handle zero total after discount', async () => {
      const order: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'FULL_DISCOUNT',
      };
      mockHttpClient.get.mockResolvedValue({ discount: 200 });
      mockPaymentService.buildPaymentMethod.mockReturnValue('CREDIT');
      mockHttpClient.post.mockResolvedValue({ ...order, id: '123' });

      await orderService.process(order);

      expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(0);
    });
  });

  describe('#createOrder', () => {
    it('should throw error when order creation fails', async () => {
      const order: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
      };
      mockHttpClient.post.mockRejectedValue(new Error());

      await expect(orderService.process(order)).rejects.toThrow(
        'Failed to create order'
      );
    });
  });
});
