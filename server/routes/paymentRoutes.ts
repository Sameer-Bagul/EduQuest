import type { Express } from "express";
import { requireAuth } from "../middleware/auth";
import { PaymentController } from "../controllers/paymentController";

export function registerPaymentRoutes(app: Express) {
  // Payment and Token routes
  app.post('/api/payments/create-order', requireAuth, PaymentController.createTokenPurchaseOrder);
  app.post('/api/payments/verify', requireAuth, PaymentController.verifyPayment);
  app.get('/api/payments/history', requireAuth, PaymentController.getPaymentHistory);
  app.get('/api/transactions/history', requireAuth, PaymentController.getTransactionHistory);
  app.get('/api/wallet', requireAuth, PaymentController.getTokenWallet);
  app.get('/api/assignments/:assignmentId/cost', requireAuth, PaymentController.calculateAssignmentCost);
}