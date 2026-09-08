import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const USERS_STORAGE_KEY = 'dentallab_users_v1';
export const SESSION_STORAGE_KEY = 'dentallab_session_v1';

export const ROLES = {
  admin: 'admin',
  operator: 'operator',
  company: 'company'
};

export function hashPassword(plain) {
  try {
    return btoa(unescape(encodeURIComponent(`dlp-v1:${plain || ''}`)));
  } catch {
    return `dlp-v1:${plain || ''}`;
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function seedUsers() {
  return [
    {
      id: 'user-admin',
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      name: 'Yönetici',
      role: ROLES.admin,
      companyId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-operator',
      username: 'kullanici',
      passwordHash: hashPassword('1234'),
      name: 'Laboratuvar Kullanıcısı',
      role: ROLES.operator,
      companyId: null,
      createdAt: new Date().toISOString()
    }
  ];
}

function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  const seeded = seedUsers();
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeded));
  } catch (e) {}
  return seeded;
}

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionId) return null;
      const all = loadUsers();
      return all.find(u => u.id === sessionId) || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  const persistSession = (user) => {
    try {
      if (user) localStorage.setItem(SESSION_STORAGE_KEY, user.id);
      else localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
  };

  const login = (username, password) => {
    const uname = (username || '').trim().toLowerCase();
    const user = users.find(u => (u.username || '').toLowerCase() === uname);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Kullanıcı adı veya şifre hatalı.' };
    }
    setCurrentUser(user);
    persistSession(user);
    return { ok: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
    persistSession(null);
  };

  const saveUser = (payload) => {
    const username = (payload.username || '').trim().toLowerCase();
    if (!username) return { ok: false, error: 'Kullanıcı adı gerekli.' };

    const duplicate = users.find(u =>
      (u.username || '').toLowerCase() === username && u.id !== payload.id
    );
    if (duplicate) return { ok: false, error: 'Bu kullanıcı adı zaten kullanılıyor.' };

    let saved;
    setUsers(prev => {
      const exists = payload.id && prev.some(u => u.id === payload.id);
      if (exists) {
        saved = prev.map(u => {
          if (u.id !== payload.id) return u;
          const next = {
            ...u,
            username,
            name: payload.name || u.name,
            role: payload.role || u.role,
            companyId: payload.companyId !== undefined ? payload.companyId : u.companyId
          };
          if (payload.password) next.passwordHash = hashPassword(payload.password);
          return next;
        });
        return saved;
      }

      saved = [
        {
          id: payload.id || makeId('user'),
          username,
          passwordHash: hashPassword(payload.password || '1234'),
          name: payload.name || username,
          role: payload.role || ROLES.operator,
          companyId: payload.companyId || null,
          createdAt: new Date().toISOString()
        },
        ...prev
      ];
      return saved;
    });

    return { ok: true };
  };

  const deleteUser = (id) => {
    const target = users.find(u => u.id === id);
    if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' };
    if (target.role === ROLES.admin && users.filter(u => u.role === ROLES.admin).length <= 1) {
      return { ok: false, error: 'Son yönetici silinemez.' };
    }
    if (currentUser?.id === id) {
      return { ok: false, error: 'Oturum açmış kullanıcı silinemez.' };
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    return { ok: true };
  };

  const upsertCompanyUser = (companyId, username, password, displayName) => {
    if (!companyId || !username) return { ok: false, error: 'Firma kullanıcısı için kullanıcı adı gerekli.' };
    const existing = users.find(u => String(u.companyId) === String(companyId) && u.role === ROLES.company);
    return saveUser({
      id: existing?.id,
      username,
      password,
      name: displayName || username,
      role: ROLES.company,
      companyId
    });
  };

  const deleteUsersByCompanyId = (companyId) => {
    setUsers(prev => prev.filter(u => u.companyId !== companyId));
  };

  const isAdmin = currentUser?.role === ROLES.admin;
  const isOperator = currentUser?.role === ROLES.operator;
  const isCompany = currentUser?.role === ROLES.company;

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        isOperator,
        isCompany,
        login,
        logout,
        saveUser,
        deleteUser,
        upsertCompanyUser,
        deleteUsersByCompanyId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
};
