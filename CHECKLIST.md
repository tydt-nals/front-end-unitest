## Test Report

- Coverage report page: [LINK](https://tydt-nals.github.io/front-end-unitest)

### Order Service Tests (10 tests)

#### `#process` (2 tests)

- should process order successfully without coupon
- should process order successfully with valid coupon

#### `#calculateTotalPrice` (7 tests)

- should throw error for undefined items
- should throw error for empty items
- should throw error for invalid item price
- should throw error for invalid item quantity
- should throw error for invalid coupon
- should throw error for null coupon
- should handle zero total after discount

#### `#createOrder` (1 test)

- should throw error when order creation fails

---

### Payment Service Tests (6 tests)

#### `#buildPaymentMethod` (5 tests)

- should return all payment methods for amounts < 300,000
- should return CREDIT and PAYPAY for amounts >= 300,000 and <= 500,000
- should return only CREDIT for amounts > 500,000
- should handle edge case when amount is exactly 300,000
- should handle edge case when amount is exactly 500,000

#### `#payViaLink` (1 test)

- should open payment link in a new window

---

### HTTP Service Tests (5 tests)

#### `#get` (2 tests)

- should successfully fetch and return data
- should throw error when response is not ok

#### `#post` (3 tests)

- should successfully post data and return response
- should throw error when response is not ok
- should handle network errors
