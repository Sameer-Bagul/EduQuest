import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { storage } from '../storage';
import { paymentService } from '../services/paymentService';
import { tokenPurchaseSchema, verifyPaymentSchema } from '@shared/schema';
import { z } from 'zod';

export class PaymentController {
  static async createTokenPurchaseOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = tokenPurchaseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request', details: result.error });
      }

      const { tokens } = result.data;

      const order = await paymentService.createOrder(tokens);

      const payment = await storage.createPayment({
        userId,
        razorpayOrderId: order.orderId,
        amount: order.amount,
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

  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = verifyPaymentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid payment verification data', details: result.error });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data;

      const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

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

      await storage.updatePayment(payment.id, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      });

      let wallet = await storage.getTokenWallet(userId);
      if (!wallet) {
        wallet = await storage.createTokenWallet({ userId, balance: 0 });
      }

      const newBalance = wallet.balance + payment.tokens;
      const updatedWallet = await storage.updateTokenBalance(userId, newBalance);

      await storage.createTransaction({
        userId,
        type: 'purchase',
        tokens: payment.tokens,
        amount: payment.amount / 100,
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

  static async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const payments = await storage.getPaymentsByUser(userId);
      
      res.json(payments.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: 'INR',
        tokens: payment.tokens,
        status: payment.status,
        createdAt: payment.createdAt,
      })));
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  }

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

  static async getTokenWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let wallet = await storage.getTokenWallet(userId);
      if (!wallet) {
        wallet = await storage.createTokenWallet({ userId, balance: 0 });
      }

      res.json(wallet);
    } catch (error) {
      console.error('Get token wallet error:', error);
      res.status(500).json({ error: 'Failed to get token wallet' });
    }
  }

  static async calculateAssignmentCost(req: AuthenticatedRequest, res: Response) {
    try {
      const { assignmentId } = req.params;
      
      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      const tokensRequired = paymentService.calculateTokensRequired(assignment.questions.length);
      const cost = paymentService.calculateTokenCost(tokensRequired);

      res.json({
        tokensRequired,
        cost,
        currency: 'INR',
        questionCount: assignment.questions.length,
        formattedCost: paymentService.formatCurrency(cost),
      });
    } catch (error) {
      console.error('Calculate assignment cost error:', error);
      res.status(500).json({ error: 'Failed to calculate assignment cost' });
    }
  }
}
