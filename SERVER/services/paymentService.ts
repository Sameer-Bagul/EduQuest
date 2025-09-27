import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize RazorPay only if credentials are available
let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('RazorPay initialized successfully');
} else {
  console.log('RazorPay credentials not found - payment functionality will be limited');
  console.log('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables to enable payments');
}

export interface TokenPurchaseRequest {
  tokens: number;
  currency: 'INR' | 'USD';
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: 'INR' | 'USD';
  key: string;
}

export class PaymentService {
  // Token pricing constants
  private readonly TOKEN_PRICE_INR = 2; // ₹2 per token
  private readonly USD_TO_INR_RATE = 88; // 1 USD = ₹88
  private readonly TOKEN_PRICE_USD = Math.round((this.TOKEN_PRICE_INR / this.USD_TO_INR_RATE) * 100) / 100; // ~$0.023

  // Calculate token cost based on currency
  calculateTokenCost(tokens: number, currency: 'INR' | 'USD'): number {
    const pricePerToken = currency === 'INR' ? this.TOKEN_PRICE_INR : this.TOKEN_PRICE_USD;
    return Math.round(tokens * pricePerToken * (currency === 'INR' ? 100 : 100)) / 100; // Amount in smallest unit
  }

  // Calculate tokens required for assignment (1 token = 4 questions)
  calculateTokensRequired(questionCount: number): number {
    return Math.ceil(questionCount / 4);
  }

  // Create RazorPay order
  async createOrder(tokens: number, currency: 'INR' | 'USD'): Promise<CreateOrderResponse> {
    if (!razorpay) {
      throw new Error('RazorPay not initialized. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }

    const cost = this.calculateTokenCost(tokens, currency);
    const amountInSmallestUnit = currency === 'INR' ? cost * 100 : cost * 100; // paise for INR, cents for USD

    const options = {
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: `token_purchase_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: amountInSmallestUnit,
      currency: currency,
      key: process.env.RAZORPAY_KEY_ID!,
    };
  }

  // Verify payment signature
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }

  // Get payment details from RazorPay
  async getPaymentDetails(paymentId: string) {
    if (!razorpay) {
      throw new Error('RazorPay not initialized. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    return await razorpay.payments.fetch(paymentId);
  }

  // Detect currency based on country (simplified geolocation)
  detectCurrency(country?: string): 'INR' | 'USD' {
    if (!country) return 'USD';
    
    // India uses INR, everything else uses USD for simplicity
    return country.toLowerCase() === 'india' || country.toLowerCase() === 'in' ? 'INR' : 'USD';
  }

  // Format currency for display
  formatCurrency(amount: number, currency: 'INR' | 'USD'): string {
    if (currency === 'INR') {
      return `₹${amount.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  }
}

export const paymentService = new PaymentService();