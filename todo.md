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
- [ ] MongoDB integration (currently using memory fallback)
- [ ] Payment system implementation
- [ ] Token-based assignment access

## Next Steps
1. Fix MongoDB connection
2. Implement core schemas
3. Add RazorPay integration
4. Build token system
5. Update dashboards with new features