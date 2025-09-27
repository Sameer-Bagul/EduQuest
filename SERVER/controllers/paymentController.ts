import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { storage } from '../storage';
import { paymentService } from '../services/paymentService';
import { tokenPurchaseSchema, verifyPaymentSchema } from '@shared/schema';
import { z } from 'zod';

export class PaymentController {
  // Create payment order for token purchase
  static async createTokenPurchaseOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate request body
      const result = tokenPurchaseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request', details: result.error });
      }

      const { tokens } = result.data;
      
      // Get user to determine currency
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Detect currency based on user's country
      const currency = user.currency || paymentService.detectCurrency(user.country);

      // Create RazorPay order
      const order = await paymentService.createOrder(tokens, currency);

      // Store payment record
      const payment = await storage.createPayment({
        userId,
        razorpayOrderId: order.orderId,
        amount: order.amount,
        currency,
        tokens,
        status: 'created',
      });

      res.json({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        key: order.key,
        tokens,
        paymentId: payment.id,
      });
    } catch (error) {
      console.error('Create token purchase order error:', error);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  }

  // Verify payment and credit tokens
  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate request body
      const result = verifyPaymentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid payment verification data', details: result.error });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data;

      // Verify payment signature
      const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      // Get payment record
      const payment = await storage.getPaymentByOrderId(razorpay_order_id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      if (payment.userId !== userId) {
        return res.status(403).json({ error: 'Payment does not belong to current user' });
      }

      if (payment.status === 'paid') {
        return res.status(400).json({ error: 'Payment already processed' });
      }

      // Update payment record
      await storage.updatePayment(payment.id, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      });

      // Get or create token wallet
      let wallet = await storage.getTokenWallet(userId);
      if (!wallet) {
        wallet = await storage.createTokenWallet({ userId, balance: 0 });
      }

      // Credit tokens to wallet
      const newBalance = wallet.balance + payment.tokens;
      const updatedWallet = await storage.updateTokenBalance(userId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: 'purchase',
        tokens: payment.tokens,
        amount: payment.amount / 100, // Convert from smallest unit
        currency: payment.currency,
        paymentId: payment.id,
        description: `Token purchase: ${payment.tokens} tokens`,
        balanceAfter: newBalance,
      });

      res.json({
        success: true,
        tokensAdded: payment.tokens,
        newBalance: newBalance,
        transactionId: payment.id,
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  }

  // Get user's payment history
  static async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const payments = await storage.getPaymentsByUser(userId);
      
      res.json(payments.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100, // Convert to main currency unit
        currency: payment.currency,
        tokens: payment.tokens,
        status: payment.status,
        createdAt: payment.createdAt,
      })));
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  }

  // Get user's transaction history
  static async getTransactionHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const transactions = await storage.getTransactionsByUser(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({ error: 'Failed to get transaction history' });
    }
  }

  // Get user's token wallet
  static async getTokenWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let wallet = await storage.getTokenWallet(userId);
      if (!wallet) {
        // Create wallet if doesn't exist
        wallet = await storage.createTokenWallet({ userId, balance: 0 });
      }

      res.json(wallet);
    } catch (error) {
      console.error('Get token wallet error:', error);
      res.status(500).json({ error: 'Failed to get token wallet' });
    }
  }

  // Calculate tokens required for assignment
  static async calculateAssignmentCost(req: AuthenticatedRequest, res: Response) {
    try {
      const { assignmentId } = req.params;
      
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const tokensRequired = paymentService.calculateTokensRequired(assignment.questions.length);
      
      // Get user's currency for cost display
      const userId = req.user?.id;
      let currency: 'INR' | 'USD' = 'USD';
      
      if (userId) {
        const user = await storage.getUser(userId);
        currency = user?.currency || paymentService.detectCurrency(user?.country);
      }

      const cost = paymentService.calculateTokenCost(tokensRequired, currency);

      res.json({
        tokensRequired,
        cost,
        currency,
        questionCount: assignment.questions.length,
        formattedCost: paymentService.formatCurrency(cost, currency),
      });
    } catch (error) {
      console.error('Calculate assignment cost error:', error);
      res.status(500).json({ error: 'Failed to calculate assignment cost' });
    }
  }
}