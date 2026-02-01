import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginRequest {
  emailid: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  status: string;
  data: {
    userid: number;
    name: string;
    email: string;
    role: string;
    acess: string;
    issuedAt: string;
    expiresAt: string;
    phoneno: string;
    token: string;
  };
}

export interface MeetingRequest {
  courseCode: string;
  courseName: string;
  meetingUrl: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdBy: string;
}

export interface MeetingResponse {
  id: number;
  courseCode: string;
  courseName: string;
  meetingUrl: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  status: string;
  data: T;
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/mantraIAS/api/auth/login', credentials);
    return response.data;
  },
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      await api.get(`/mantraIAS/api/auth/admin/user/email/${encodeURIComponent(email)}`);
      return true; // Email exists
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // Email doesn't exist
      }
      throw error; // Other errors
    }
  },
  sendRegisterOtp: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/auth/OTP/register/otp?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  sendForgotPasswordOtp: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/auth/OTP/forgot-password/otp?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  validateOtp: async (email: string, otp: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/auth/OTP/forgot-password/validate?email=${encodeURIComponent(email)}&otp=${otp}`);
    return response.data;
  },
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/auth/OTP/forgot-password/reset?email=${encodeURIComponent(email)}&otp=${otp}&newPassword=${newPassword}`);
    return response.data;
  },
};

export const meetingsAPI = {
  getAll: async (): Promise<ApiResponse<MeetingResponse[]>> => {
    const response = await api.get('/api/meetings/admin/all');
    return response.data;
  },
  getByDate: async (date: string): Promise<ApiResponse<MeetingResponse[]>> => {
    const response = await api.get(`/api/meetings/date/${date}`);
    return response.data;
  },
  create: async (meeting: MeetingRequest): Promise<ApiResponse<MeetingResponse>> => {
    const response = await api.post('/api/meetings/admin', meeting);
    return response.data;
  },
  update: async (id: number, meeting: MeetingRequest): Promise<ApiResponse<MeetingResponse>> => {
    const response = await api.put(`/api/meetings/admin/${id}`, meeting);
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/meetings/admin/${id}`);
    return response.data;
  },
  deletePastMeetings: async (): Promise<ApiResponse<string>> => {
    const response = await api.delete('/api/meetings/admin/past');
    return response.data;
  },
};

export interface MockTestRequest {
  name: string;
  timerInMinutes: number;
}

export interface MockTestResponse {
  id: number;
  name: string;
  timerInMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export const mockTestsAPI = {
  // Paid Mock Tests
  getAllPaid: async (): Promise<ApiResponse<MockTestResponse[]>> => {
    const response = await api.get('/api/admin/mocktests');
    return response.data;
  },
  createPaid: async (mockTest: MockTestRequest): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.post('/api/admin/mocktests', mockTest);
    return response.data;
  },
  updatePaid: async (id: number, mockTest: MockTestRequest): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.put(`/api/admin/mocktests/${id}`, mockTest);
    return response.data;
  },
  deletePaid: async (id: number): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/mocktests/${id}`);
    return response.data;
  },
  // Free Mock Tests
  getAllFree: async (): Promise<ApiResponse<MockTestResponse[]>> => {
    const response = await api.get('/api/admin/Free/mocktests');
    return response.data;
  },
  createFree: async (mockTest: MockTestRequest): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.post('/api/admin/Free/mocktests', mockTest);
    return response.data;
  },
  updateFree: async (id: number, mockTest: MockTestRequest): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.put(`/api/admin/Free/mocktests/${id}`, mockTest);
    return response.data;
  },
  deleteFree: async (id: number): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/Free/mocktests/${id}`);
    return response.data;
  },
};

export interface QuestionRequest {
  questionNo: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export interface QuestionDTO {
  id: number;
  questionNo: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export const questionsAPI = {
  getByMockTest: async (mockTestId: number): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get(`/api/admin/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  create: async (mockTestId: number, question: QuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.post(`/api/admin/mocktests/${mockTestId}/questions`, question);
    return response.data;
  },
  update: async (questionId: number, question: QuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.put(`/api/admin/mocktests/questions/${questionId}`, question);
    return response.data;
  },
  delete: async (questionId: number): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/mocktests/questions/${questionId}`);
    return response.data;
  },
};

export const freeQuestionsAPI = {
  getByMockTest: async (mockTestId: number): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get(`/api/admin/Free/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  create: async (mockTestId: number, question: QuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.post(`/api/admin/Free/mocktests/${mockTestId}/questions`, question);
    return response.data;
  },
  update: async (questionId: number, question: QuestionRequest): Promise<ApiResponse<QuestionResponse>> => {
    const response = await api.put(`/api/admin/Free/mocktests/questions/${questionId}`, question);
    return response.data;
  },
  delete: async (questionId: number): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/Free/mocktests/questions/${questionId}`);
    return response.data;
  },
};

export interface UserRequest {
  name: string;
  emailid: string;
  password: string;
  phoneno: string;
  gender?: string;
  dob?: string;
  highestQualification?: string;
  university?: string;
  yearOfPassing?: number;
  attemptsGiven?: number;
  state?: string;
  city?: string;
  pinCode?: string;
  address?: string;
  dateOfJoining?: string;
  aadharNumber?: string;
  acess: string;
  roles: string;
  status: string;
}

export interface UserResponse {
  userid: number;
  name: string;
  emailid: string;
  phoneno: string;
  gender?: string;
  dob?: string;
  highestQualification?: string;
  university?: string;
  yearOfPassing?: number;
  attemptsGiven?: number;
  state?: string;
  city?: string;
  pinCode?: string;
  address?: string;
  dateOfJoining?: string;
  aadharNumber?: string;
  acess: string;
  roles: string;
  status: string;
}

export const usersAPI = {
  getAll: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get('/mantraIAS/api/auth/admin/allusers');
    return response.data;
  },
  update: async (userid: number, user: UserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/mantraIAS/api/auth/user/${userid}`, user);
    return response.data;
  },
  getById: async (userid: number): Promise<UserResponse> => {
    const response = await api.get(`/mantraIAS/api/auth/user/${userid}`);
    return response.data;
  },
  getByEmail: async (email: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get(`/mantraIAS/api/auth/admin/user/email/${encodeURIComponent(email)}`);
    return response.data;
  },
  createUser: async (user: UserRequest): Promise<string> => {
    const response = await api.post('/mantraIAS/api/auth/register/user', user);
    return response.data;
  },
  createAdmin: async (user: UserRequest): Promise<string> => {
    const response = await api.post('/mantraIAS/api/auth/register/admin', user);
    return response.data;
  },
};

export interface DPPRequest {
  question: string;
  description?: string;
  difficulty: string;
  createdBy: string;
  date: string;
}

export interface DPPResponse {
  id: number;
  question: string;
  description?: string;
  difficulty: string;
  createdBy: string;
  date: string;
}

export const dppAPI = {
  getAll: async (): Promise<DPPResponse[]> => {
    const response = await api.get('/api/dpp');
    return response.data;
  },
  getById: async (id: number): Promise<DPPResponse> => {
    const response = await api.get(`/api/dpp/${id}`);
    return response.data;
  },
  getByDate: async (date: string): Promise<DPPResponse[]> => {
    const response = await api.get(`/api/dpp/date/${date}`);
    return response.data;
  },
  create: async (dpp: DPPRequest): Promise<DPPResponse> => {
    const response = await api.post('/api/dpp', dpp);
    return response.data;
  },
  update: async (id: number, dpp: DPPRequest): Promise<DPPResponse> => {
    const response = await api.put(`/api/dpp/${id}`, dpp);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/dpp/${id}`);
  },
  deletePast: async (): Promise<ApiResponse<string>> => {
    const response = await api.delete('/api/dpp/admin/past');
    return response.data;
  },
};

export interface MockTestScore {
  id: number;
  userId: number;
  mockTestId: number;
  mockTestTitle: string;
  score: number;
  completedAt: string;
}

export interface AttemptTestDTO {
  id?: number;
  userId: number;
  mockTestId: number;
  mockTestName: string;
  timerInMinutes: number;
  startedAt: string;
  submittedAt?: string;
  isCompleted: boolean;
  questions: AttemptQuestionDTO[];
}

export interface AttemptQuestionDTO {
  questionId: number;
  questionNo: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption?: string;
}

export const userMeetingsAPI = {
  getUpcoming: async (): Promise<ApiResponse<MeetingResponse[]>> => {
    const response = await api.get('/api/meetings/upcoming');
    return response.data;
  },
  getByDate: async (date: string): Promise<ApiResponse<MeetingResponse[]>> => {
    const response = await api.get(`/api/meetings/date/${date}`);
    return response.data;
  },
  getByCourse: async (courseCode: string): Promise<ApiResponse<MeetingResponse[]>> => {
    const response = await api.get(`/api/meetings/course/${courseCode}`);
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<MeetingResponse>> => {
    const response = await api.get(`/api/meetings/${id}`);
    return response.data;
  },
};

export const userDppAPI = {
  getByDate: async (date: string): Promise<DPPResponse[]> => {
    const response = await api.get(`/api/dpp/date/${date}`);
    return response.data;
  },
  getToday: async (): Promise<DPPResponse[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/dpp/date/${today}`);
    return response.data;
  },
};
  export const userMockTestsAPI = {
  getAllPaid: async (): Promise<ApiResponse<MockTestResponse[]>> => {
    const response = await api.get('/api/user/mocktests');
    return response.data;
  },
  getAllFree: async (): Promise<ApiResponse<MockTestResponse[]>> => {
    const response = await api.get('/api/user/free/mocktests');
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.get(`/api/user/mocktests/${id}`);
    return response.data;
  },
  getFreeById: async (id: number): Promise<ApiResponse<MockTestResponse>> => {
    const response = await api.get(`/api/user/free/mocktests/${id}`);
    return response.data;
  },
  getQuestions: async (mockTestId: number): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get(`/api/user/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  getFreeQuestions: async (mockTestId: number): Promise<ApiResponse<QuestionResponse[]>> => {
    const response = await api.get(`/api/user/free/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  getQuestionsByMockTest: async (mockTestId: number): Promise<ApiResponse<QuestionDTO[]>> => {
    const response = await api.get(`/api/admin/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  getFreeQuestionsByMockTest: async (mockTestId: number): Promise<ApiResponse<QuestionDTO[]>> => {
    const response = await api.get(`/api/admin/Free/mocktests/${mockTestId}/questions`);
    return response.data;
  },
  attemptPaidTest: async (mockTestId: number, userId: number): Promise<ApiResponse<AttemptTestDTO>> => {
    const response = await api.post(`/api/admin/mocktests/${mockTestId}/attempt?userId=${userId}`);
    return response.data;
  },
  attemptFreeTest: async (mockTestId: number, userId: number): Promise<ApiResponse<AttemptTestDTO>> => {
    const response = await api.post(`/api/admin/Free/mocktests/${mockTestId}/attempt?userId=${userId}`);
    return response.data;
  },
  calculatePaidScore: async (mockTestId: number, userId: number, userAnswers: { [key: number]: string }): Promise<ApiResponse<number>> => {
    const response = await api.post(`/api/admin/mocktests/${mockTestId}/calculate-score?userId=${userId}`, userAnswers);
    return response.data;
  },
  calculateFreeScore: async (mockTestId: number, userId: number, userAnswers: { [key: number]: string }): Promise<ApiResponse<number>> => {
    const response = await api.post(`/api/admin/Free/mocktests/${mockTestId}/calculate-score?userId=${userId}`, userAnswers);
    return response.data;
  },
  getPaidTestResults: async (mockTestId: number, userId: number, userAnswers: { [key: number]: string }): Promise<ApiResponse<any[]>> => {
    const response = await api.post(`/api/admin/mocktests/${mockTestId}/results?userId=${userId}`, userAnswers);
    return response.data;
  },
  getFreeTestResults: async (mockTestId: number, userId: number, userAnswers: { [key: number]: string }): Promise<ApiResponse<any[]>> => {
    const response = await api.post(`/api/admin/Free/mocktests/${mockTestId}/results?userId=${userId}`, userAnswers);
    return response.data;
  },
};

export const scoresAPI = {
  saveScore: async (userId: number, mockTestId: number, mockTestTitle: string, score: number): Promise<MockTestScore> => {
    const response = await api.post(`/api/scores?userId=${userId}&mockTestId=${mockTestId}&mockTestTitle=${encodeURIComponent(mockTestTitle)}&score=${score}`);
    return response.data;
  },
  getUserScores: async (userId: number): Promise<MockTestScore[]> => {
    const response = await api.get(`/api/scores/user/${userId}`);
    return response.data;
  },
  getAllScores: async (): Promise<MockTestScore[]> => {
    const response = await api.get('/api/scores/all');
    return response.data;
  },
};

export default api;