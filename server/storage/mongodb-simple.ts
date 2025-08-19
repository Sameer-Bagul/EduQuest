import mongoose from "mongoose";
import { type User, type InsertUser, type Assignment, type InsertAssignment, type Submission, type InsertSubmission } from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "../storage";

// Simple MongoDB connection and models
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['teacher', 'student'] },
  googleId: { type: String, sparse: true },
  passwordHash: String,
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
  assignmentId: String,
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

// Indexes
assignmentSchema.index({ code: 1 });
assignmentSchema.index({ teacherId: 1 });
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const UserModel = mongoose.model('User', userSchema);
const AssignmentModel = mongoose.model('Assignment', assignmentSchema);
const SubmissionModel = mongoose.model('Submission', submissionSchema);

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
    const submissions = await SubmissionModel.find({ studentId });
    return submissions.map(transformDoc);
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
}