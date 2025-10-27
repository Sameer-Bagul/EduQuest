import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay: Razorpay | null = null;

function initializeRazorpay(): Razorpay | null {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    if (!razorpay) {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log('RazorPay initialized successfully');
    }
    return razorpay;
  } else {
    console.log('RazorPay credentials not found - payment functionality will be limited');
    console.log('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables to enable payments');
    return null;
  }
}

export interface TokenPurchaseRequest {
  tokens: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: 'INR';
  key: string;
}

export class PaymentService {
  private readonly TOKEN_PRICE_INR = 2; // ₹2 per token

  calculateTokenCost(tokens: number): number {
    return tokens * this.TOKEN_PRICE_INR;
  }

  calculateTokensRequired(questionCount: number): number {
    return Math.ceil(questionCount / 4);
  }

  async createOrder(tokens: number): Promise<CreateOrderResponse> {
    const razorpayInstance = initializeRazorpay();
    if (!razorpayInstance) {
      throw new Error('RazorPay not initialized. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }

    const cost = this.calculateTokenCost(tokens);
    const amountInPaise = cost * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `token_purchase_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID!,
    };
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }

  async getPaymentDetails(paymentId: string) {
    const razorpayInstance = initializeRazorpay();
    if (!razorpayInstance) {
      throw new Error('RazorPay not initialized. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    return await razorpayInstance.payments.fetch(paymentId);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }
}

export const paymentService = new PaymentService();
