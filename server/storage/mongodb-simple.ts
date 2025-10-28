import mongoose from "mongoose";
import { 
  type College, type InsertCollege,
  type User, type InsertUser, 
  type Assignment, type InsertAssignment, 
  type Submission, type InsertSubmission,
  type TokenWallet, type InsertTokenWallet,
  type Transaction, type InsertTransaction,
  type Payment, type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "../storage";

// College Schema
const collegeSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  name: { type: String, required: true },
  location: String,
  country: String,
  type: { type: String, enum: ['university', 'college', 'institute'] },
}, { 
  timestamps: true,
  _id: false
});

// Simple MongoDB connection and models
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['teacher', 'student', 'admin'] },
  collegeId: String,
  googleId: { type: String, sparse: true },
  passwordHash: String,
  country: String,
  tokenBalance: { type: Number, default: 0 },
  totalAssignments: { type: Number, default: 0 },
}, { 
  timestamps: true,
  _id: false
});

const assignmentSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  code: { type: String, unique: true },
  title: String,
  mode: { type: String, enum: ['voice', 'voice_text'] },
  facultyName: String,
  collegeName: String,
  subjectName: String,
  subjectCode: String,
  startDate: String,
  endDate: String,
  expireAt: String,
  autoDelete: { type: Boolean, default: true },
  teacherId: String,
  questions: [{
    id: { type: String, default: () => randomUUID() },
    text: String,
    answerKey: String,
  }],
}, { 
  timestamps: true,
  _id: false
});

const submissionSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  assignmentId: { type: String, ref: 'Assignment' },
  studentId: String,
  answers: [{
    questionId: String,
    text: String,
    sttMeta: mongoose.Schema.Types.Mixed,
  }],
  scores: [{
    questionId: String,
    similarity: Number,
    awarded: Number,
  }],
  totalAwarded: Number,
}, { 
  timestamps: true,
  _id: false
});

// Token Wallet Schema
const tokenWalletSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
}, { 
  timestamps: true,
  _id: false
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  userId: { type: String, required: true },
  type: { type: String, enum: ['purchase', 'deduction'], required: true },
  tokens: { type: Number, required: true },
  amount: Number,
  assignmentId: String,
  paymentId: String,
  description: String,
  balanceAfter: { type: Number, required: true },
}, { 
  timestamps: true,
  _id: false
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  userId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  status: { type: String, enum: ['created', 'paid', 'failed', 'cancelled'], default: 'created' },
}, { 
  timestamps: true,
  _id: false
});

// Indexes
collegeSchema.index({ name: 1 });
assignmentSchema.index({ teacherId: 1 });
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ assignmentId: 1 });
paymentSchema.index({ userId: 1 });

const CollegeModel = mongoose.model('College', collegeSchema);
const UserModel = mongoose.model('User', userSchema);
const AssignmentModel = mongoose.model('Assignment', assignmentSchema);
const SubmissionModel = mongoose.model('Submission', submissionSchema);
const TokenWalletModel = mongoose.model('TokenWallet', tokenWalletSchema);
const TransactionModel = mongoose.model('Transaction', transactionSchema);
const PaymentModel = mongoose.model('Payment', paymentSchema);

function transformDoc(doc: any): any {
  if (!doc) return undefined;
  const obj = doc.toObject();
  obj.id = obj._id;
  obj.createdAt = obj.createdAt.toISOString();
  obj.updatedAt = obj.updatedAt.toISOString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

export class MongoStorage implements IStorage {
  private connected = false;

  async connect() {
    if (this.connected) return;
    
    try {
      await mongoose.connect(process.env.MONGODB_URI!, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      this.connected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  private generateAssignmentCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // College operations
  async getCollege(id: string): Promise<College | undefined> {
    await this.connect();
    const college = await CollegeModel.findById(id);
    return transformDoc(college);
  }

  async getAllColleges(): Promise<College[]> {
    await this.connect();
    const colleges = await CollegeModel.find().sort({ name: 1 });
    return colleges.map(transformDoc);
  }

  async searchColleges(query: string): Promise<College[]> {
    await this.connect();
    const colleges = await CollegeModel.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 }).limit(50);
    return colleges.map(transformDoc);
  }

  async createCollege(insertCollege: InsertCollege): Promise<College> {
    await this.connect();
    const college = new CollegeModel(insertCollege);
    await college.save();
    return transformDoc(college);
  }

  async updateCollege(id: string, updates: Partial<College>): Promise<College | undefined> {
    await this.connect();
    const college = await CollegeModel.findByIdAndUpdate(id, updates, { new: true });
    return transformDoc(college);
  }

  async deleteCollege(id: string): Promise<boolean> {
    await this.connect();
    const result = await CollegeModel.findByIdAndDelete(id);
    return !!result;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findById(id);
    return transformDoc(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findOne({ email });
    return transformDoc(user);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findOne({ googleId });
    return transformDoc(user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.connect();
    const user = new UserModel(insertUser);
    await user.save();
    return transformDoc(user);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await this.connect();
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    return transformDoc(user);
  }

  async getAllUsers(): Promise<User[]> {
    await this.connect();
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map(transformDoc);
  }

  async getUsersByRole(role: 'teacher' | 'student' | 'admin'): Promise<User[]> {
    await this.connect();
    const users = await UserModel.find({ role }).sort({ createdAt: -1 });
    return users.map(transformDoc);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.connect();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  // Assignment operations
  async getAssignment(id: string): Promise<Assignment | undefined> {
    await this.connect();
    const assignment = await AssignmentModel.findById(id);
    return transformDoc(assignment);
  }

  async getAssignmentByCode(code: string): Promise<Assignment | undefined> {
    await this.connect();
    const assignment = await AssignmentModel.findOne({ code });
    return transformDoc(assignment);
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    await this.connect();
    const assignments = await AssignmentModel.find({ teacherId });
    return assignments.map(transformDoc);
  }

  async createAssignment(data: InsertAssignment & { teacherId: string }): Promise<Assignment> {
    await this.connect();
    
    let code: string;
    let attempts = 0;
    do {
      code = this.generateAssignmentCode();
      attempts++;
    } while (await AssignmentModel.findOne({ code }) && attempts < 10);

    if (attempts >= 10) {
      throw new Error('Unable to generate unique assignment code');
    }

    // Calculate expireAt based on endDate and retention policy
    const endDate = new Date(data.endDate);
    const retentionDays = parseInt(process.env.AUTO_DELETE_RETENTION_DAYS || '0');
    const expireAt = new Date(endDate.getTime() + (retentionDays * 24 * 60 * 60 * 1000));

    const assignmentData = {
      ...data,
      code,
      expireAt: expireAt.toISOString(),
      questions: data.questions.map(q => ({ ...q, id: randomUUID() })),
    };

    const assignment = new AssignmentModel(assignmentData);
    await assignment.save();
    return transformDoc(assignment);
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | undefined> {
    await this.connect();
    const assignment = await AssignmentModel.findByIdAndUpdate(id, updates, { new: true });
    return transformDoc(assignment);
  }

  async deleteAssignment(id: string): Promise<boolean> {
    await this.connect();
    const result = await AssignmentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getExpiredAssignments(): Promise<Assignment[]> {
    await this.connect();
    const now = new Date().toISOString();
    const assignments = await AssignmentModel.find({ 
      autoDelete: true, 
      expireAt: { $lt: now } 
    });
    return assignments.map(transformDoc);
  }

  // Submission operations
  async getSubmission(id: string): Promise<Submission | undefined> {
    await this.connect();
    const submission = await SubmissionModel.findById(id);
    return transformDoc(submission);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    await this.connect();
    const submissions = await SubmissionModel.find({ assignmentId });
    return submissions.map(transformDoc);
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    await this.connect();
    const submissions = await SubmissionModel.find({ studentId }).populate('assignmentId');
    return submissions.map(submission => {
      const obj = transformDoc(submission);
      // Rename assignmentId to assignment for frontend compatibility
      obj.assignment = obj.assignmentId;
      delete obj.assignmentId;
      return obj;
    });
  }

  async getSubmissionByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission | undefined> {
    await this.connect();
    const submission = await SubmissionModel.findOne({ assignmentId, studentId });
    return transformDoc(submission);
  }

  async createSubmission(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    await this.connect();
    const newSubmission = new SubmissionModel(submission);
    await newSubmission.save();
    return transformDoc(newSubmission);
  }

  // Token Wallet operations
  async getTokenWallet(userId: string): Promise<TokenWallet | undefined> {
    await this.connect();
    const wallet = await TokenWalletModel.findOne({ userId });
    return transformDoc(wallet);
  }

  async createTokenWallet(insertWallet: InsertTokenWallet): Promise<TokenWallet> {
    await this.connect();
    const wallet = new TokenWalletModel(insertWallet);
    await wallet.save();
    return transformDoc(wallet);
  }

  async updateTokenBalance(userId: string, newBalance: number): Promise<TokenWallet | undefined> {
    await this.connect();
    const wallet = await TokenWalletModel.findOneAndUpdate(
      { userId }, 
      { balance: newBalance }, 
      { new: true }
    );
    return transformDoc(wallet);
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    await this.connect();
    const transaction = await TransactionModel.findById(id);
    return transformDoc(transaction);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    await this.connect();
    const transactions = await TransactionModel.find({ userId }).sort({ createdAt: -1 });
    return transactions.map(transformDoc);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    await this.connect();
    const transaction = new TransactionModel(insertTransaction);
    await transaction.save();
    return transformDoc(transaction);
  }

  // Payment operations
  async getPayment(id: string): Promise<Payment | undefined> {
    await this.connect();
    const payment = await PaymentModel.findById(id);
    return transformDoc(payment);
  }

  async getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | undefined> {
    await this.connect();
    const payment = await PaymentModel.findOne({ razorpayOrderId });
    return transformDoc(payment);
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    await this.connect();
    const payments = await PaymentModel.find({ userId }).sort({ createdAt: -1 });
    return payments.map(transformDoc);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    await this.connect();
    const payment = new PaymentModel(insertPayment);
    await payment.save();
    return transformDoc(payment);
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    await this.connect();
    const payment = await PaymentModel.findByIdAndUpdate(id, updates, { new: true });
    return transformDoc(payment);
  }

  // Atomic operations for token system
  async deductTokensForAssignment(userId: string, tokens: number, assignmentId: string): Promise<{wallet: TokenWallet, transaction: Transaction}> {
    await this.connect();

    // Start session for atomic transaction
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        // Get current wallet or create if doesn't exist
        let wallet = await TokenWalletModel.findOne({ userId }).session(session);
        if (!wallet) {
          wallet = new TokenWalletModel({ userId, balance: 0 });
          await wallet.save({ session });
        }

        // Check if user has enough tokens
        if (wallet.balance < tokens) {
          throw new Error('Insufficient token balance');
        }

        // Deduct tokens
        const newBalance = wallet.balance - tokens;
        const updatedWallet = await TokenWalletModel.findOneAndUpdate(
          { userId }, 
          { balance: newBalance }, 
          { new: true, session }
        );

        if (!updatedWallet) {
          throw new Error('Failed to update wallet balance');
        }

        // Create transaction record
        const transaction = new TransactionModel({
          userId,
          type: 'deduction',
          tokens,
          assignmentId,
          description: `Assignment access: ${assignmentId}`,
          balanceAfter: newBalance,
        });
        await transaction.save({ session });

        return { 
          wallet: transformDoc(updatedWallet), 
          transaction: transformDoc(transaction) 
        };
      });
    } finally {
      await session.endSession();
    }
  }

  // Admin analytics operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalColleges: number;
    totalAssignments: number;
    totalSubmissions: number;
    totalRevenue: number;
  }> {
    await this.connect();

    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalColleges,
      totalAssignments,
      totalSubmissions,
      revenueResult
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: 'teacher' }),
      UserModel.countDocuments({ role: 'student' }),
      CollegeModel.countDocuments(),
      AssignmentModel.countDocuments(),
      SubmissionModel.countDocuments(),
      PaymentModel.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalColleges,
      totalAssignments,
      totalSubmissions,
      totalRevenue: totalRevenue / 100,
    };
  }

  async getCollegeStats(): Promise<Array<{
    collegeId: string;
    collegeName: string;
    userCount: number;
    teacherCount: number;
    studentCount: number;
    revenue: number;
  }>> {
    await this.connect();

    const colleges = await CollegeModel.find();
    const stats = await Promise.all(
      colleges.map(async (college) => {
        const collegeId = college._id;
        const [userCount, teacherCount, studentCount, revenueResult] = await Promise.all([
          UserModel.countDocuments({ collegeId }),
          UserModel.countDocuments({ collegeId, role: 'teacher' }),
          UserModel.countDocuments({ collegeId, role: 'student' }),
          PaymentModel.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: '$user' },
            { $match: { 'user.collegeId': collegeId, status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        ]);

        return {
          collegeId,
          collegeName: college.name,
          userCount,
          teacherCount,
          studentCount,
          revenue: (revenueResult[0]?.total || 0) / 100,
        };
      })
    );

    return stats.sort((a, b) => b.revenue - a.revenue);
  }

  async getRevenueByMonth(): Promise<Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>> {
    await this.connect();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await PaymentModel.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return result.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue / 100,
      transactions: item.transactions
    }));
  }

  async getAllAssignments(): Promise<Assignment[]> {
    await this.connect();
    const assignments = await AssignmentModel.find().sort({ createdAt: -1 });
    return assignments.map(transformDoc);
  }

  async getAllSubmissions(): Promise<Submission[]> {
    await this.connect();
    const submissions = await SubmissionModel.find().sort({ createdAt: -1 });
    return submissions.map(transformDoc);
  }
}