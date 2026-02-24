import { db } from '../lib/firebase';
import { ref, set, onValue } from 'firebase/database';

// ===== Types =====
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  classId?: string;
  semester?: number;
  rollNo?: string;
  phone?: string;
  createdAt: string;
}

export interface ClassSection {
  id: string;
  name: string;
  department: string;
  semester: number;
  section: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId: string;
  semester: number;
}

export interface Session {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  qrCode: string;
  date: string;
  startTime: string;
  endTime: string;
  expiresAt: number;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
}

// ===== Generate ID =====
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// ===== Initial Mock Data =====
const initialUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Dr. Rajesh Kumar',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    phone: '9876543210',
    createdAt: '2025-01-01',
  },
  {
    id: 'teacher-1',
    name: 'Prof. Anita Sharma',
    email: 'anita@university.edu',
    password: 'teacher123',
    role: 'teacher',
    department: 'Computer Science',
    phone: '9876543211',
    createdAt: '2025-01-15',
  },
  {
    id: 'teacher-2',
    name: 'Prof. Vikram Singh',
    email: 'vikram@university.edu',
    password: 'teacher123',
    role: 'teacher',
    department: 'Computer Science',
    phone: '9876543212',
    createdAt: '2025-02-01',
  },
  {
    id: 'student-1',
    name: 'Priya Patel',
    email: 'priya@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-1',
    semester: 4,
    rollNo: 'CS2024001',
    phone: '9876543213',
    createdAt: '2025-06-01',
  },
  {
    id: 'student-2',
    name: 'Rahul Verma',
    email: 'rahul@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-1',
    semester: 4,
    rollNo: 'CS2024002',
    phone: '9876543214',
    createdAt: '2025-06-01',
  },
  {
    id: 'student-3',
    name: 'Sanjana Gupta',
    email: 'sanjana@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-1',
    semester: 4,
    rollNo: 'CS2024003',
    phone: '9876543215',
    createdAt: '2025-06-01',
  },
  {
    id: 'student-4',
    name: 'Amit Kumar',
    email: 'amit@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-1',
    semester: 4,
    rollNo: 'CS2024004',
    phone: '9876543216',
    createdAt: '2025-06-01',
  },
  {
    id: 'student-5',
    name: 'Neha Reddy',
    email: 'neha@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-2',
    semester: 6,
    rollNo: 'CS2023001',
    phone: '9876543217',
    createdAt: '2025-06-01',
  },
  {
    id: 'student-6',
    name: 'Arjun Nair',
    email: 'arjun@student.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    classId: 'class-2',
    semester: 6,
    rollNo: 'CS2023002',
    phone: '9876543218',
    createdAt: '2025-06-01',
  },
];

const initialClasses: ClassSection[] = [
  { id: 'class-1', name: 'CS-4A', department: 'Computer Science', semester: 4, section: 'A' },
  { id: 'class-2', name: 'CS-6A', department: 'Computer Science', semester: 6, section: 'A' },
  { id: 'class-3', name: 'CS-2A', department: 'Computer Science', semester: 2, section: 'A' },
];

const initialSubjects: Subject[] = [
  { id: 'sub-1', name: 'Data Structures & Algorithms', code: 'CS301', classId: 'class-1', teacherId: 'teacher-1', semester: 4 },
  { id: 'sub-2', name: 'Database Management Systems', code: 'CS302', classId: 'class-1', teacherId: 'teacher-2', semester: 4 },
  { id: 'sub-3', name: 'Machine Learning', code: 'CS501', classId: 'class-2', teacherId: 'teacher-1', semester: 6 },
  { id: 'sub-4', name: 'Computer Networks', code: 'CS303', classId: 'class-1', teacherId: 'teacher-1', semester: 4 },
  { id: 'sub-5', name: 'Artificial Intelligence', code: 'CS502', classId: 'class-2', teacherId: 'teacher-2', semester: 6 },
];

// ===== Data Store (LocalStorage backed) =====
const STORAGE_KEY = 'qr_attendance_data';

interface AppData {
  users: User[];
  classes: ClassSection[];
  subjects: Subject[];
  sessions: Session[];
  attendance: AttendanceRecord[];
}

let isFirebaseInitialized = false;

// Initialize Firebase Sync
const initFirebaseSync = () => {
  if (isFirebaseInitialized) return;

  // Subscribe to Firebase changes
  const dbRef = ref(db, STORAGE_KEY);
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Update local storage silently whenever cloud data changes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  });
  isFirebaseInitialized = true;
};

const getStoredData = (): AppData => {
  initFirebaseSync();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  // Initialize with real structure — no fake/random attendance
  const initial: AppData = {
    users: initialUsers,
    classes: initialClasses,
    subjects: initialSubjects,
    sessions: [],
    attendance: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  // Push initial payload to empty Firebase
  set(ref(db, STORAGE_KEY), initial).catch(console.error);
  return initial;
};

const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Also push mutations to Firebase
  set(ref(db, STORAGE_KEY), data).catch(console.error);
};

// ===== Data Access Functions =====
export const getData = (): AppData => getStoredData();

export const getUsers = (): User[] => getStoredData().users;
export const getClasses = (): ClassSection[] => getStoredData().classes;
export const getSubjects = (): Subject[] => getStoredData().subjects;
export const getSessions = (): Session[] => getStoredData().sessions;
export const getAttendance = (): AttendanceRecord[] => getStoredData().attendance;

export const getUserById = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const getClassById = (id: string): ClassSection | undefined => getClasses().find(c => c.id === id);
export const getSubjectById = (id: string): Subject | undefined => getSubjects().find(s => s.id === id);

export const getStudentsByClass = (classId: string): User[] =>
  getUsers().filter(u => u.role === 'student' && u.classId === classId);

export const getSubjectsByTeacher = (teacherId: string): Subject[] =>
  getSubjects().filter(s => s.teacherId === teacherId);

export const getSubjectsByClass = (classId: string): Subject[] =>
  getSubjects().filter(s => s.classId === classId);

export const getAttendanceByStudent = (studentId: string): AttendanceRecord[] =>
  getAttendance().filter(a => a.studentId === studentId);

export const getAttendanceBySubject = (subjectId: string): AttendanceRecord[] =>
  getAttendance().filter(a => a.subjectId === subjectId);

export const getAttendanceBySession = (sessionId: string): AttendanceRecord[] =>
  getAttendance().filter(a => a.sessionId === sessionId);

export const getStudentAttendanceForSubject = (studentId: string, subjectId: string): AttendanceRecord[] =>
  getAttendance().filter(a => a.studentId === studentId && a.subjectId === subjectId);

// Calculate attendance percentage
export const getAttendancePercentage = (studentId: string, subjectId: string): number => {
  const records = getStudentAttendanceForSubject(studentId, subjectId);
  if (records.length === 0) return 0;
  const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
  return Math.round((present / records.length) * 100);
};

// ===== Data Mutation Functions =====
export const addUser = (user: User): void => {
  const data = getStoredData();
  data.users.push(user);
  saveData(data);
};

export const updateUser = (id: string, updates: Partial<User>): void => {
  const data = getStoredData();
  const index = data.users.findIndex(u => u.id === id);
  if (index !== -1) {
    data.users[index] = { ...data.users[index], ...updates };
    saveData(data);
  }
};

export const deleteUser = (id: string): void => {
  const data = getStoredData();
  data.users = data.users.filter(u => u.id !== id);
  saveData(data);
};

export const addClass = (cls: ClassSection): void => {
  const data = getStoredData();
  data.classes.push(cls);
  saveData(data);
};

export const deleteClass = (id: string): void => {
  const data = getStoredData();
  data.classes = data.classes.filter(c => c.id !== id);
  saveData(data);
};

export const addSubject = (subject: Subject): void => {
  const data = getStoredData();
  data.subjects.push(subject);
  saveData(data);
};

export const deleteSubject = (id: string): void => {
  const data = getStoredData();
  data.subjects = data.subjects.filter(s => s.id !== id);
  saveData(data);
};

export const addSession = (session: Session): void => {
  const data = getStoredData();
  data.sessions.push(session);
  saveData(data);
};

export const updateSession = (id: string, updates: Partial<Session>): void => {
  const data = getStoredData();
  const index = data.sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    data.sessions[index] = { ...data.sessions[index], ...updates };
    saveData(data);
  }
};

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  const data = getStoredData();
  // Prevent duplicate attendance for same session and student
  const exists = data.attendance.find(
    a => a.sessionId === record.sessionId && a.studentId === record.studentId
  );
  if (!exists) {
    data.attendance.push(record);
    saveData(data);
  }
};

export const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>): void => {
  const data = getStoredData();
  const index = data.attendance.findIndex(a => a.id === id);
  if (index !== -1) {
    data.attendance[index] = { ...data.attendance[index], ...updates };
    saveData(data);
  }
};

// Login validation
export const authenticateUser = (email: string, password: string, role: UserRole): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password && u.role === role) || null;
};

// Reset data
export const resetData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
