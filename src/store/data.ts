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
  registeredDeviceId?: string; // Device locking: once registered, only this device can scan
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
  // Anti-proxy: rotating tokens
  currentToken?: string;
  tokenGeneratedAt?: number;
  tokenHistory?: string[]; // last few tokens for grace period
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
  // Anti-proxy fields
  deviceId?: string;
  scannedToken?: string;
  flagged?: boolean;
  flagReason?: string;
}

export interface ProxyLog {
  id: string;
  timestamp: string;
  type: 'expired_qr' | 'same_device' | 'screenshot_detected';
  studentId: string;        // The student who attempted
  studentName: string;      // Name for quick display
  sessionId: string;
  subjectId: string;
  subjectName?: string;
  // For same-device proxy
  proxyForStudentId?: string;   // The other student on same device
  proxyForStudentName?: string;
  deviceId?: string;
  details: string;          // Human-readable description
}

// ===== Generate ID =====
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// ===== Anti-Proxy: Generate short-lived token =====
export const generateQRToken = (): string => {
  return Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
};

// ===== Anti-Proxy: Device Fingerprinting =====
export const getDeviceFingerprint = (): string => {
  // Check if we already have a stored fingerprint for this browser
  const storedFp = localStorage.getItem('device_fingerprint');
  if (storedFp) return storedFp;

  // Generate a new fingerprint based on browser properties
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasHash = 'no-canvas';
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    canvasHash = canvas.toDataURL().slice(-50);
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    canvasHash,
    // Add a random component to make it truly unique per browser installation
    Math.random().toString(36).substring(2, 15),
  ];

  // Simple hash function
  const rawStr = components.join('|');
  let hash = 0;
  for (let i = 0; i < rawStr.length; i++) {
    const char = rawStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const fingerprint = 'dev-' + Math.abs(hash).toString(36) + '-' + Date.now().toString(36);
  localStorage.setItem('device_fingerprint', fingerprint);
  return fingerprint;
};

// ===== Anti-Proxy: Validate a scanned QR token against a session =====
export const isValidQRToken = (sessionId: string, token: string): { valid: boolean; reason?: string } => {
  const data = getStoredData();
  const session = data.sessions.find(s => s.id === sessionId);
  if (!session) return { valid: false, reason: 'Session not found' };
  if (!session.isActive) return { valid: false, reason: 'Session has ended' };
  if (session.expiresAt <= Date.now()) return { valid: false, reason: 'Session expired' };

  // Check if the token matches current or any recent token (grace period)
  if (session.currentToken === token) return { valid: true };
  if (session.tokenHistory && session.tokenHistory.includes(token)) return { valid: true };

  return { valid: false, reason: 'QR code has expired or is invalid. Please scan the latest QR code displayed on screen.' };
};

// ===== Anti-Proxy: Check if a device already marked attendance for another student =====
export const checkDeviceProxy = (sessionId: string, deviceId: string, currentStudentId: string): { isProxy: boolean; existingStudentName?: string } => {
  const data = getStoredData();
  const existingRecord = data.attendance.find(
    a => a.sessionId === sessionId && a.deviceId === deviceId && a.studentId !== currentStudentId
  );
  if (existingRecord) {
    const existingStudent = data.users.find(u => u.id === existingRecord.studentId);
    return { isProxy: true, existingStudentName: existingStudent?.name || 'Another student' };
  }
  return { isProxy: false };
};

// ===== Anti-Proxy: Update session with new rotating token =====
export const rotateSessionToken = (sessionId: string): string => {
  const data = getStoredData();
  const index = data.sessions.findIndex(s => s.id === sessionId);
  if (index === -1) return '';

  const newToken = generateQRToken();
  const session = data.sessions[index];

  // Keep last 1 token in history for grace period (covers ~5 seconds)
  const history = session.tokenHistory || [];
  if (session.currentToken) {
    history.push(session.currentToken);
  }
  // Only keep the last 1 token (shorter grace for 5s rotation)
  while (history.length > 1) {
    history.shift();
  }

  data.sessions[index] = {
    ...session,
    currentToken: newToken,
    tokenGeneratedAt: Date.now(),
    tokenHistory: history,
  };

  saveData(data);
  return newToken;
};

// ===== Device Locking: Register a device to a student (first scan locks it) =====
export const registerStudentDevice = (studentId: string, deviceId: string): void => {
  const data = getStoredData();
  const index = data.users.findIndex(u => u.id === studentId);
  if (index === -1) return;

  // Only register if not already registered
  if (!data.users[index].registeredDeviceId) {
    data.users[index] = { ...data.users[index], registeredDeviceId: deviceId };
    saveData(data);
  }
};

// ===== Device Locking: Check if student is using their registered device =====
export const checkStudentDeviceLock = (studentId: string, currentDeviceId: string): {
  allowed: boolean;
  isFirstScan: boolean;
  registeredDeviceId?: string;
} => {
  const data = getStoredData();
  const student = data.users.find(u => u.id === studentId);
  if (!student) return { allowed: false, isFirstScan: false };

  // No registered device yet — this is the first scan, allow it
  if (!student.registeredDeviceId) {
    return { allowed: true, isFirstScan: true };
  }

  // Check if device matches the registered one
  if (student.registeredDeviceId === currentDeviceId) {
    return { allowed: true, isFirstScan: false, registeredDeviceId: student.registeredDeviceId };
  }

  // Different device — blocked!
  return {
    allowed: false,
    isFirstScan: false,
    registeredDeviceId: student.registeredDeviceId,
  };
};

// ===== Device Locking: Admin can reset a student's registered device =====
export const resetStudentDevice = (studentId: string): void => {
  const data = getStoredData();
  const index = data.users.findIndex(u => u.id === studentId);
  if (index === -1) return;
  data.users[index] = { ...data.users[index], registeredDeviceId: undefined };
  saveData(data);
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
  proxyLogs: ProxyLog[];
}

let isFirebaseInitialized = false;

// Initialize Firebase Sync
const initFirebaseSync = () => {
  if (isFirebaseInitialized) return;

  // Subscribe to Firebase changes
  const dbRef = ref(db, STORAGE_KEY);
  onValue(dbRef, (snapshot: any) => {
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
    if (stored) {
      const parsed = JSON.parse(stored);
      // Firebase Realtime DB strips empty arrays, so we must replenish them if missing
      return {
        users: parsed.users || [],
        classes: parsed.classes || [],
        subjects: parsed.subjects || [],
        sessions: parsed.sessions || [],
        attendance: parsed.attendance || [],
        proxyLogs: parsed.proxyLogs || [],
      };
    }
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
    proxyLogs: [],
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
export const getProxyLogs = (): ProxyLog[] => getStoredData().proxyLogs;

// ===== Proxy Log Functions =====
export const addProxyLog = (log: ProxyLog): void => {
  const data = getStoredData();
  data.proxyLogs.push(log);
  saveData(data);
};

export const getProxyLogsBySession = (sessionId: string): ProxyLog[] =>
  getProxyLogs().filter(l => l.sessionId === sessionId);

export const getProxyLogsByStudent = (studentId: string): ProxyLog[] =>
  getProxyLogs().filter(l => l.studentId === studentId || l.proxyForStudentId === studentId);

export const clearProxyLog = (logId: string): void => {
  const data = getStoredData();
  data.proxyLogs = data.proxyLogs.filter(l => l.id !== logId);
  saveData(data);
};

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

export const addAttendanceRecord = (record: AttendanceRecord): { success: boolean; reason?: string } => {
  const data = getStoredData();
  // Prevent duplicate attendance for same session and student
  const exists = data.attendance.find(
    a => a.sessionId === record.sessionId && a.studentId === record.studentId
  );
  if (exists) {
    return { success: false, reason: 'Attendance already marked for this session.' };
  }

  // Anti-proxy: Check if same device was used by a different student
  if (record.deviceId) {
    const deviceUsedBy = data.attendance.find(
      a => a.sessionId === record.sessionId && a.deviceId === record.deviceId && a.studentId !== record.studentId
    );
    if (deviceUsedBy) {
      const otherStudent = data.users.find(u => u.id === deviceUsedBy.studentId);
      // Flag the record but still allow it (teacher can review flagged records)
      record.flagged = true;
      record.flagReason = `Same device used by ${otherStudent?.name || 'another student'}. Possible proxy attendance.`;

      // Also flag the original record
      const origIndex = data.attendance.findIndex(a => a.id === deviceUsedBy.id);
      if (origIndex !== -1) {
        data.attendance[origIndex].flagged = true;
        data.attendance[origIndex].flagReason = `Same device also used by ${record.studentId}. Possible proxy attendance.`;
      }
    }
  }

  data.attendance.push(record);
  saveData(data);
  return { success: true };
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
