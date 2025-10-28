import { apiRequest } from "./queryClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  collegeId: string;
}

export interface CreateAssignmentData {
  title: string;
  mode: 'voice' | 'voice_text';
  facultyName: string;
  collegeName: string;
  subjectName: string;
  subjectCode: string;
  startDate: string;
  endDate: string;
  autoDelete: boolean;
  questions: Array<{
    text: string;
    answerKey: string;
  }>;
}

export interface SubmitAssignmentData {
  assignmentCode: string;
  answers: Array<{
    questionId: string;
    text: string;
    sttMeta?: any;
  }>;
}

export const api = {
  // Auth
  async login(data: LoginData) {
    const response = await apiRequest('POST', '/api/auth/login', data);
    return response.json();
  },

  async register(data: RegisterData) {
    const response = await apiRequest('POST', '/api/auth/register', data);
    return response.json();
  },

  async logout() {
    const response = await apiRequest('POST', '/api/auth/logout');
    return response.json();
  },

  async getMe() {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },

  // Assignments
  async createAssignment(data: CreateAssignmentData) {
    const response = await apiRequest('POST', '/api/assignments', data);
    return response.json();
  },

  async getTeacherAssignments() {
    const response = await apiRequest('GET', '/api/assignments/teacher');
    return response.json();
  },

  async getAssignmentByCode(code: string) {
    const response = await apiRequest('GET', `/api/assignments/code/${code}`);
    return response.json();
  },

  // Submissions
  async submitAssignment(data: SubmitAssignmentData) {
    const response = await apiRequest('POST', '/api/submissions', data);
    return response.json();
  },

  async getStudentSubmissions() {
    const response = await apiRequest('GET', '/api/submissions/student');
    return response.json();
  },

  async getAssignmentSubmissions(assignmentId: string) {
    const response = await apiRequest('GET', `/api/submissions/assignment/${assignmentId}`);
    return response.json();
  },

  // Wallet & Payments
  async getWallet() {
    const response = await apiRequest('GET', '/api/wallet');
    return response.json();
  },

  async getTransactionHistory() {
    const response = await apiRequest('GET', '/api/transactions/history');
    return response.json();
  },

  async getPaymentHistory() {
    const response = await apiRequest('GET', '/api/payments/history');
    return response.json();
  },

  async createTokenPurchaseOrder(tokens: number) {
    const response = await apiRequest('POST', '/api/payments/create-order', { tokens });
    return response.json();
  },

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const response = await apiRequest('POST', '/api/payments/verify', paymentData);
    return response.json();
  },

  async getAssignmentCost(assignmentId: string) {
    const response = await apiRequest('GET', `/api/assignments/${assignmentId}/cost`);
    return response.json();
  }
};
