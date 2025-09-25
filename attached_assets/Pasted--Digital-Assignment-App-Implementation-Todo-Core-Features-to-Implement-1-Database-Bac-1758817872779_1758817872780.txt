# Digital Assignment App - Implementation Todo

## Core Features to Implement

### 1. Database & Backend Architecture
- [ ] Set up MongoDB connection
- [ ] Create MongoDB schemas for:
  - [ ] Users (students/teachers with role-based access)
  - [ ] Assignments (with question count and metadata)
  - [ ] Token Wallets (user token balances)
  - [ ] Transactions (token deductions and purchases)
  - [ ] Payments (RazorPay order tracking)

### 2. Payment System
- [ ] Integrate RazorPay payment gateway
- [ ] Implement currency detection (India = INR, Outside = USD)
- [ ] Token pricing system:
  - [ ] Base: ₹2 per token
  - [ ] USD conversion: $0.023 per token (₹88 = $1)
- [ ] Token calculation: 1 token = 4 questions (ceil(questions/4))

### 3. Authentication & User Management
- [ ] User registration with geolocation for currency
- [ ] Login/logout with JWT tokens
- [ ] Role-based access (student vs teacher)

### 4. Assignment System
- [ ] Teacher assignment creation
- [ ] Token requirement calculation
- [ ] Assignment access control (token-gated)
- [ ] Assignment completion tracking

### 5. Payment Workflow
- [ ] Token purchase flow
- [ ] RazorPay order creation
- [ ] Payment verification
- [ ] Token wallet updates
- [ ] Transaction logging

### 6. User Interface
- [ ] Student Dashboard:
  - [ ] Token balance display
  - [ ] Buy tokens functionality
  - [ ] Available assignments
  - [ ] Assignment history
- [ ] Teacher Dashboard:
  - [ ] Create assignments
  - [ ] View assignment analytics
- [ ] Account Section:
  - [ ] Profile management
  - [ ] Wallet overview
  - [ ] Transaction history
  - [ ] Payment history

### 7. Security & Reliability
- [ ] Atomic token transactions
- [ ] Race condition handling
- [ ] Payment signature verification
- [ ] Data encryption (passwords, sensitive info)

## Current Status
- [x] Basic UI components created
- [x] Express server setup
- [x] React frontend structure
- [x] MongoDB schemas implemented (currently using memory fallback)
- [x] Payment system implementation (RazorPay integration)
- [x] Token-based assignment access
- [x] Backend API routes for payment and wallet management
- [x] Assignment submission with token deduction

## COMPLETED BACKEND IMPLEMENTATION ✅

### ✅ Core Features Implemented:
1. **Token & Payment System**:
   - Token pricing: ₹2 per token (base), $0.023 per token (USD)
   - Currency detection: India = INR, Outside = USD
   - Token calculation: 1 token = 4 questions (ceil(questions/4))
   - RazorPay integration for payment processing

2. **Database Schemas** (MongoDB):
   - Users (with country/currency fields)
   - Assignments (existing)
   - Token Wallets (user token balances)
   - Transactions (token purchases/deductions)
   - Payments (RazorPay order tracking)

3. **API Routes**:
   - `POST /api/payments/create-order` - Create token purchase order
   - `POST /api/payments/verify` - Verify payment and credit tokens
   - `GET /api/payments/history` - Get payment history
   - `GET /api/transactions/history` - Get transaction history  
   - `GET /api/wallet` - Get token wallet balance
   - `GET /api/assignments/:id/cost` - Calculate assignment cost
   - `POST /api/submissions` - Submit assignment (with token deduction)

4. **Token Deduction Workflow**:
   - Assignment submission requires sufficient tokens
   - Atomic token deduction (prevents race conditions)
   - Detailed error messages for insufficient balance
   - Transaction logging for all token operations

## SETUP REQUIREMENTS 🔧

To complete the setup, you need to configure:

### 1. MongoDB Connection
Set environment variable: `MONGODB_URI=your_mongodb_connection_string`
- Currently using memory storage as fallback
- Get MongoDB Atlas connection string or local MongoDB URL

### 2. RazorPay Configuration  
Set environment variables:
- `RAZORPAY_KEY_ID=your_razorpay_key_id`
- `RAZORPAY_KEY_SECRET=your_razorpay_key_secret`
- Get these from RazorPay dashboard after account setup

### 3. JWT Configuration (recommended)
Set environment variable: `JWT_SECRET=your_secure_jwt_secret`

## REMAINING FRONTEND WORK 🎨

### Still To Do:
1. **Account Section UI**:
   - [ ] Profile management with country/currency
   - [ ] Wallet widget showing token balance  
   - [ ] "Buy Tokens" button and modal
   - [ ] Transaction history table
   - [ ] Payment history table

2. **Student Dashboard Updates**:
   - [ ] Token balance display
   - [ ] Assignment cost preview before access
   - [ ] Insufficient balance warning with purchase option
   - [ ] Assignment history with token costs

3. **Teacher Dashboard**:
   - [ ] Assignment creation shows token requirement preview
   - [ ] Student participation analytics (optional)

4. **Assignment Interface**:
   - [ ] Show token cost before starting
   - [ ] Redirect to payment if insufficient balance
   - [ ] Success message showing tokens deducted

## TESTING THE SYSTEM 🧪

1. **Register/Login** as student or teacher
2. **Create Assignment** (teacher) - tokens auto-calculated
3. **Check Assignment Cost** via API
4. **Try Assignment Access** without tokens (should fail)
5. **Add Test Tokens** directly to database for testing
6. **Submit Assignment** (should deduct tokens successfully)

The backend is fully functional! Focus on UI integration next.