export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user';
  password?: string; // Stored securely in client storage for dummy demo
}

const KEYS = {
  USERS: 'sk_registered_users',
  SESSION: 'sk_active_session',
} as const;

// Preloaded Dummy Users
const DUMMY_USERS: User[] = [
  {
    id: 'u-dummy-admin',
    fullName: 'SK Admin',
    email: 'admin@sk.com',
    mobile: '8796807060',
    role: 'admin',
    password: 'SK@123',
  },
  {
    id: 'u-dummy-user',
    fullName: 'Ajit Undare',
    email: 'user@gmail.com',
    mobile: '9876543210',
    role: 'user',
    password: 'user123',
  },
];

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('localStorage write failed for key:', key);
  }
}

// ─── Initialize Store ────────────────────────────────────────────────────────
function getStoredUsers(): User[] {
  const users = safeGet<User[]>(KEYS.USERS);
  if (!users) {
    // If empty, seed with dummy users
    safeSet(KEYS.USERS, DUMMY_USERS);
    return DUMMY_USERS;
  }
  return users;
}

// ─── Auth Operations ─────────────────────────────────────────────────────────

export function registerUser(data: Omit<User, 'id' | 'role'> & { password: User['password'] }): { success: boolean; error?: string } {
  const users = getStoredUsers();

  const emailLower = data.email.toLowerCase().trim();
  const exists = users.some(u => u.email.toLowerCase() === emailLower);
  if (exists) {
    return { success: false, error: 'Email address already registered' };
  }

  const newUser: User = {
    id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName: data.fullName,
    email: emailLower,
    mobile: data.mobile,
    role: 'user', // newly registered users are always standard users
    password: data.password,
  };

  safeSet(KEYS.USERS, [...users, newUser]);
  return { success: true };
}

export async function login(usernameOrEmail: string, passwordStr: string): Promise<{ success: boolean; user?: Omit<User, 'password'>; error?: string }> {
  const emailLower = usernameOrEmail.toLowerCase().trim();
  
  // Commented out API calls to work fully offline
  /*
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api";
    const response = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailLower,
        password: passwordStr,
      }),
    });

    if (!response.ok) {
      let errText = 'Invalid credentials';
      try {
        const errJson = await response.json();
        errText = errJson.message || errText;
      } catch {
        // use default
      }
      return { success: false, error: errText };
    }

    const data = await response.json();

    const normalizedRole = data.role === 'ADMIN' ? 'admin' : 'user';

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", normalizedRole);
    localStorage.setItem("fullName", data.fullName);

    // Create session object (without password)
    const sessionUser: Omit<User, 'password'> = {
      id: data.id ? String(data.id) : `u-${Date.now()}`,
      fullName: data.fullName,
      email: data.email || emailLower,
      mobile: data.mobile || '',
      role: normalizedRole,
    };

    safeSet(KEYS.SESSION, sessionUser);

    // Dispatch dynamic storage event to notify other components (e.g. Navbar)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authChange'));
    }

    return { success: true, user: sessionUser };
  } catch (err) {
    console.error("Backend login failed, attempting local fallback...", err);
  }
  */

  const users = getStoredUsers();
  const found = users.find(u => u.email.toLowerCase() === emailLower || u.fullName.toLowerCase() === emailLower);

  if (!found || found.password !== passwordStr) {
    return { success: false, error: 'Invalid username/email or password' };
  }

  // Create session object (without password)
  const sessionUser: Omit<User, 'password'> = {
    id: found.id,
    fullName: found.fullName,
    email: found.email,
    mobile: found.mobile,
    role: found.role,
  };

  safeSet(KEYS.SESSION, sessionUser);
  localStorage.setItem("role", found.role);
  localStorage.setItem("fullName", found.fullName);

  // Dispatch dynamic storage event to notify other components (e.g. Navbar)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('authChange'));
  }

  return { success: true, user: sessionUser };
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("fullName");

  // Clear admin session key too for back-compatibility
  sessionStorage.removeItem('sk_admin_auth');

  // Dispatch events
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('authChange'));
}

export function getCurrentUser(): Omit<User, 'password'> | null {
  return safeGet<Omit<User, 'password'>>(KEYS.SESSION);
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}
