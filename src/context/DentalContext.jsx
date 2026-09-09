import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchAllFromSupabase,
  saveOrderToSupabase,
  deleteOrderFromSupabase,
  saveCompanyToSupabase,
  deleteCompanyFromSupabase,
  saveDoctorToSupabase,
  deleteDoctorFromSupabase,
  savePatientToSupabase,
  deletePatientFromSupabase,
  clearAllFromSupabase,
  uploadStlToSupabase,
  deleteStlFromSupabase,
  linkFilesToOrderInSupabase
} from '../services/supabaseService';

const DentalContext = createContext(null);

const STORAGE_KEY = 'dentallab_data_clean_v8';
const DB_CONFIG_KEY = 'dentallab_database_config_v2';

export function idsMatch(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function orderBelongsToCompany(order, companyId, patients = [], doctors = []) {
  if (!order || companyId == null || companyId === '') return false;
  if (idsMatch(order.companyId, companyId)) return true;
  const pat = (patients || []).find(p => idsMatch(p.id, order.patientId));
  if (pat && idsMatch(pat.companyId, companyId)) return true;
  const doc = (doctors || []).find(d => idsMatch(d.id, order.doctorId));
  if (doc && idsMatch(doc.companyId, companyId)) return true;
  return false;
}

const APPROVAL_STEP = {
  order: 1,
  name: 'Onay',
  description: 'Kullanıcıdan gelen iş emri yönetici onayını bekler.',
  defaultTechnician: 'Yusuf Usta',
  estimatedHours: 0
};

const OTHER_PIPELINE_STEPS = [
  { ...APPROVAL_STEP },
  { order: 2, name: 'Ölçü + Model', description: 'Klinik ölçüsü alınır, laboratuvara aktarılır ve çalışma modeli elde edilir.', defaultTechnician: 'Ayşe Teknisyen', estimatedHours: 3 },
  { order: 3, name: 'Altyapı', description: 'Restorasyon altyapısı hazırlanır.', defaultTechnician: 'Ali Usta', estimatedHours: 3 },
  { order: 4, name: 'Opak', description: 'Opak uygulaması yapılır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 2 },
  { order: 5, name: 'Dentin', description: 'Dentin katmanı yığılır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 3 },
  { order: 6, name: 'Glaze', description: 'Glaze ve parlatma tamamlanır.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 }
];

const IMPLANT_PIPELINE_STEPS = [
  { ...APPROVAL_STEP },
  { order: 2, name: 'Ölçü + Model', description: 'İmplant ölçüsü alınır ve analoglu çalışma modeli elde edilir.', defaultTechnician: 'Ayşe Teknisyen', estimatedHours: 3 },
  { order: 3, name: 'Abutment + Freze', description: 'Abutment / dayanak hazırlanır ve altyapı veya üstyapı frezelenir.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 7 },
  { order: 4, name: 'Torklama + Ölçü', description: 'Abutment torklanır ve torklama sonrası kontrol ölçüsü alınır.', defaultTechnician: 'Ali Usta', estimatedHours: 3 },
  { order: 5, name: 'Altyapı', description: 'Porselen öncesi altyapı hazırlanır.', defaultTechnician: 'Ali Usta', estimatedHours: 3 },
  { order: 6, name: 'Prova', description: 'Altyapı / üstyapı provası yapılır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 2 },
  { order: 7, name: 'Glaze', description: 'Glaze ve parlatma tamamlanır.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 }
];

export const DEFAULT_MATERIALS = {
  mdp: {
    id: 'mdp',
    name: 'MDP (Metal Destekli Porselen)',
    badgeClass: 'badge-mat-mdp',
    color: '#d97706',
    description: 'Metal destekli porselen restorasyon üretimi.',
    steps: OTHER_PIPELINE_STEPS.map(s => ({ ...s }))
  },
  zirconia: {
    id: 'zirconia',
    name: 'Zirkonyum',
    badgeClass: 'badge-mat-zirconia',
    color: '#0284c7',
    description: 'Zirkonyum restorasyon üretimi.',
    steps: OTHER_PIPELINE_STEPS.map(s => ({ ...s }))
  },
  implant: {
    id: 'implant',
    name: 'İmplant',
    badgeClass: 'badge-mat-implant',
    color: '#059669',
    description: 'İmplant üstü protez üretimi. Son etaptan MDP (metal destekli porselen) işine geçilebilir.',
    steps: IMPLANT_PIPELINE_STEPS.map(s => ({ ...s }))
  },
  lamina: {
    id: 'lamina',
    name: 'Lamina',
    badgeClass: 'badge-mat-lamina',
    color: '#7c3aed',
    description: 'Lamina restorasyon üretimi.',
    steps: OTHER_PIPELINE_STEPS.map(s => ({ ...s }))
  }
};

const MATERIAL_ID_ALIASES = {
  emax: 'lamina',
  porcelain: 'mdp'
};

export function normalizeStepName(name) {
  const n = (name || '').trim();
  if (n === 'Ölçü' || n === 'Model' || n === 'Ölçü + Model') return 'Ölçü + Model';
  if (n === 'Abutment' || n === 'Freze' || n === 'Abutment + Freze') return 'Abutment + Freze';
  if (n === 'Torklama' || n === 'Ölçü 2' || n === 'Torklama + Ölçü') return 'Torklama + Ölçü';
  return n;
}

function mapLegacyStepName(name) {
  return normalizeStepName(name);
}

function mergeById(localList = [], remoteList = []) {
  const map = new Map();
  (localList || []).forEach(item => {
    if (item?.id == null) return;
    map.set(String(item.id), item);
  });
  (remoteList || []).forEach(item => {
    if (item?.id == null) return;
    const key = String(item.id);
    const local = map.get(key);
    map.set(key, local ? { ...local, ...item } : item);
  });
  return Array.from(map.values());
}

function nextOrderId(orders) {
  const year = new Date().getFullYear();
  let max = 0;
  (orders || []).forEach(o => {
    const match = String(o.id || '').match(/ORD-\d+-(\d+)/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  const used = new Set((orders || []).map(o => o.id));
  let n = max + 1;
  let id = `ORD-${year}-${String(n).padStart(3, '0')}`;
  while (used.has(id)) {
    n += 1;
    id = `ORD-${year}-${String(n).padStart(3, '0')}`;
  }
  return id;
}

export function migrateOrderToCurrentPipeline(order) {
  if (!order) return order;
  const materialId = MATERIAL_ID_ALIASES[order.materialId] || order.materialId;
  const template = DEFAULT_MATERIALS[materialId] || DEFAULT_MATERIALS.mdp;
  const resolvedId = template.id;
  const templateNames = template.steps.map(s => s.name);
  const currentNames = (order.steps || []).map(s => s.name);
  const alreadyMigrated =
    currentNames.length === templateNames.length &&
    currentNames.every((name, idx) => name === templateNames[idx]);

  if (alreadyMigrated && order.materialId === resolvedId) return order;

  const isCompleted = order.status === 'completed';
  const isPending = order.status === 'pending_approval' || order.status === 'rejected';
  const oldIdx = order.currentStepIndex || 0;
  const oldStep = (order.steps || [])[oldIdx];
  const mappedName = isPending ? 'Onay' : mapLegacyStepName(oldStep?.name);

  let newIdx = template.steps.findIndex(s => s.name === mappedName);
  if (newIdx < 0) {
    const oldLen = Math.max(1, (order.steps || []).length);
    newIdx = Math.min(Math.floor((oldIdx / oldLen) * template.steps.length), template.steps.length - 1);
  }
  if (isCompleted) newIdx = template.steps.length - 1;
  else if (!isPending && template.steps[newIdx]?.name === 'Onay') newIdx = Math.min(1, template.steps.length - 1);

  const steps = template.steps.map((s, idx) => ({
    order: s.order,
    name: s.name,
    description: s.description,
    technician: (order.steps && order.steps[Math.min(oldIdx, Math.max(0, (order.steps || []).length - 1))]?.technician) || s.defaultTechnician || '',
    notes: '',
    status: isCompleted || idx < newIdx ? 'completed' : (idx === newIdx ? 'in_progress' : 'pending'),
    startedAt: idx === newIdx ? (oldStep?.startedAt || null) : null,
    completedAt: idx < newIdx ? (order.steps?.[Math.min(idx, Math.max(0, (order.steps || []).length - 1))]?.completedAt || null) : null,
    completedDate: idx < newIdx ? (order.steps?.[Math.min(idx, Math.max(0, (order.steps || []).length - 1))]?.completedDate || null) : null
  }));

  return {
    ...order,
    materialId: resolvedId,
    companyId: order.companyId != null ? String(order.companyId) : order.companyId,
    steps,
    currentStepIndex: newIdx
  };
}

export function migrateOrdersToCurrentPipeline(orders) {
  if (!Array.isArray(orders)) return [];
  return orders.map(migrateOrderToCurrentPipeline);
}

export const IMPLANT_COMPLETED_LABEL = 'İmplant tamamlandı';

export function isOrderFromCompletedImplant(order) {
  if (!order) return false;
  if (order.fromImplantId || order.implantCompleted) return true;
  return (order.notes || '').includes(IMPLANT_COMPLETED_LABEL);
}

export const VITA_SHADES = [
  'A1', 'A2', 'A3', 'A3.5', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
  'D2', 'D3', 'D4',
  'BL1 (Bleach)', 'BL2 (Bleach)', 'BL3 (Bleach)', 'BL4 (Bleach)'
];

export const TECHNICIANS_STORAGE_KEY = 'dentallab_technicians_v2';
export const DEFAULT_TECHNICIANS = [
  { id: 'tech-1', name: 'Yusuf Usta', role: 'Baş Teknisyen / Seramist' },
  { id: 'tech-2', name: 'Murat Teknisyen', role: 'CAD/CAM Sorumlusu' },
  { id: 'tech-3', name: 'Ali Usta', role: 'Metal & Altyapı Uzmanı' },
  { id: 'tech-4', name: 'Ayşe Teknisyen', role: 'Alçı & Model Sorumlusu' },
  { id: 'tech-5', name: 'Elif Teknisyen', role: 'Glaze & Polisaj Uzmanı' }
];

export const TECHNICIANS = DEFAULT_TECHNICIANS.map(t => t.name);

// TEMİZ BAŞLANGIÇ: ÖRNEK VERİLER TAMAMEN KALDIRILDI!
const EMPTY_INITIAL_DATA = {
  companies: [],
  doctors: [],
  patients: [],
  orders: []
};

export const DentalProvider = ({ children }) => {
  const { currentUser, isCompany, isOperator, clearAdminRecovery } = useAuth();
  // Eski tüm mock önbellek anahtarlarını sil
  useEffect(() => {
    try {
      const oldKeys = [
        'dental_lab_pro_react_db_v2',
        'dental_lab_pro_db_v1',
        'dentallab_cloud_cache_v1',
        'dentallab_cloud_cache_v2',
        'dentallab_cloud_cache_v3',
        'dentallab_clean_db_v4',
        'dentallab_clean_db_v5'
      ];
      oldKeys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('dentallab_data_clean_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isOldMock = parsed?.companies?.some(c => c.name?.includes('Dentİstanbul'));
        if (parsed && Array.isArray(parsed.orders) && !isOldMock) {
          return {
            ...parsed,
            orders: migrateOrdersToCurrentPipeline(parsed.orders)
          };
        }
      }
    } catch (e) {
      console.error('Veri okuma hatası:', e);
    }
    return EMPTY_INITIAL_DATA;
  });

  // Veritabanı Yapılandırması (Supabase / Vercel Postgres)
  const [dbConfig, setDbConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      provider: 'supabase', // 'supabase' | 'vercel'
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      apiUrl: '/api/db'
    };
  });

  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('connected'); // 'connected' | 'connecting' | 'offline'

  const [theme, setTheme] = useState(() => localStorage.getItem('dental_theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Dinamik Teknisyen / Ekip Yönetimi
  const [techniciansList, setTechniciansList] = useState(() => {
    try {
      const saved = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TECHNICIANS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(techniciansList));
    } catch (e) {}
  }, [techniciansList]);

  // Veritabanına Otomatik Kaydetme
  const persistToDatabase = useCallback(async (dataToPersist) => {
    setIsDbLoading(true);
    try {
      // Supabase doğrudan tablo bazında (saveOrderToSupabase vb.) kaydedilir.
      // Opsiyonel /api/db endpointi varsa yedek olarak gönderilir
      if (dbConfig.apiUrl && dbConfig.apiUrl !== '/api/db') {
        await fetch(dbConfig.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToPersist)
        }).catch(() => {});
      }
      setDbStatus('connected');
    } catch (e) {
      setDbStatus('connected');
    } finally {
      setIsDbLoading(false);
    }
  }, [dbConfig]);

  // Veritabanından Verileri Çekme
  const fetchFromDatabase = useCallback(async () => {
    setIsDbLoading(true);

    try {
      // 1. Supabase PostgreSQL Veritabanı
      const remote = await fetchAllFromSupabase();
      if (remote) {
        const migratedRemote = migrateOrdersToCurrentPipeline(remote.orders || []);
        setData(prev => {
          const merged = {
            companies: mergeById(prev.companies, remote.companies),
            doctors: mergeById(prev.doctors, remote.doctors),
            patients: mergeById(prev.patients, remote.patients),
            orders: mergeById(prev.orders, migratedRemote)
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        setDbStatus('connected');
        return;
      }

      // 2. /api/db endpointi (Vercel Serverless / Yedek)
      const res = await fetch(dbConfig.apiUrl || '/api/db');
      if (res.ok) {
        const result = await res.json();
        if (result && result.data && Array.isArray(result.data.orders)) {
          const isMock = result.data.companies?.some(c => c.name?.includes('Dentİstanbul'));
          if (!isMock) {
            const migrated = {
              ...result.data,
              orders: migrateOrdersToCurrentPipeline(result.data.orders)
            };
            setData(migrated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          }
          setDbStatus('connected');
        }
      }
    } catch (e) {
      setDbStatus('connected');
    } finally {
      setIsDbLoading(false);
    }
  }, [dbConfig]);

  // İlk açılışta veritabanından çek
  useEffect(() => {
    fetchFromDatabase();
  }, [fetchFromDatabase]);

  // Veri değiştiğinde hem yerel belleğe yaz hem veritabanına kaydet
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    persistToDatabase(data);
  }, [data, persistToDatabase]);

  // Cihazlar arası veri tazeleme (Pencereye dönüldüğünde)
  useEffect(() => {
    const handleFocus = () => {
      fetchFromDatabase();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchFromDatabase]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dental_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveDbConfig = (newConfig) => {
    const next = { ...dbConfig, ...newConfig };
    setDbConfig(next);
    localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(next));
  };

  const testAndSyncDb = () => {
    fetchFromDatabase();
  };

  // Tüm Verileri Tamamen Temizleme (Tertemiz Boş Başlangıç)
  const clearAllData = async () => {
    const empty = JSON.parse(JSON.stringify(EMPTY_INITIAL_DATA));
    setData(empty);
    setTechniciansList(DEFAULT_TECHNICIANS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
      const oldKeys = [
        'dentallab_data_clean_v7',
        'dentallab_data_clean_v6',
        'dentallab_clean_db_v5',
        'dentallab_clean_db_v4',
        'dental_lab_pro_react_db_v2',
        'dental_lab_pro_db_v1',
        'dentallab_cloud_cache_v1',
        'dentallab_cloud_cache_v2',
        'dentallab_cloud_cache_v3'
      ];
      oldKeys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    } catch (e) {}

    // 1. Supabase PostgreSQL veritabanındaki tüm tabloları temizle
    try {
      await clearAllFromSupabase();
    } catch (err) {
      console.error('Supabase sıfırlama hatası:', err);
    }

    // 2. /api/db endpointi varsa orayı da sıfırla
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empty)
      });
    } catch (e) {}

    if (typeof clearAdminRecovery === 'function') {
      clearAdminRecovery();
    }

    showToast('Tüm veriler ve bulut veritabanı başarıyla sıfırlandı! ✓', 'success');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dentallab_veriler_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tüm verileriniz JSON dosyası olarak indirildi.');
  };

  const importData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.orders !== undefined && parsed.companies !== undefined) {
        const migrated = {
          ...parsed,
          orders: migrateOrdersToCurrentPipeline(parsed.orders)
        };
        setData(migrated);
        persistToDatabase(migrated);
        showToast('Veriler başarıyla yüklendi ve veritabanına aktarıldı!');
        return true;
      }
    } catch (e) {
      showToast('Geçersiz JSON dosyası!', 'error');
    }
    return false;
  };

  const denyProductionChange = () => {
    if (isCompany || isOperator) {
      showToast(
        isCompany
          ? 'Firma hesabı işleri ilerletemez; yalnızca durumunu takip edebilir.'
          : 'Kullanıcı işleri ilerletemez; yalnızca kendi iş emrini onaylanana kadar düzenleyebilir.',
        'error'
      );
      return true;
    }
    return false;
  };

  // --- CRUD Metotları ---
  const saveOrder = async (order) => {
    let finalOrder = { ...order };

    if (isCompany) {
      const companyId = String(currentUser?.companyId || '');
      if (!companyId) {
        showToast('Kullanıcıya bağlı bir firma/klinik kaydı bulunamadı.', 'error');
        return null;
      }
      const existing = finalOrder.id ? (data.orders || []).find(o => o.id === finalOrder.id) : null;
      if (existing) {
        if (existing.status !== 'pending_approval' || (String(existing.companyId) !== companyId && existing.createdBy !== currentUser?.id)) {
          showToast('Onaylanan veya kliniğinize ait olmayan iş emri düzenlenemez.', 'error');
          return null;
        }
        finalOrder = {
          ...existing,
          ...finalOrder,
          companyId,
          status: 'pending_approval',
          currentStepIndex: 0
        };
      } else {
        finalOrder.companyId = companyId;
        finalOrder.status = 'pending_approval';
        finalOrder.createdBy = currentUser?.id;
        finalOrder.currentStepIndex = 0;
      }
    } else if (isOperator) {
      const existing = finalOrder.id ? (data.orders || []).find(o => o.id === finalOrder.id) : null;
      if (existing) {
        if (existing.createdBy !== currentUser?.id || existing.status !== 'pending_approval') {
          showToast('Onaylanan veya size ait olmayan iş emri düzenlenemez.', 'error');
          return null;
        }
        finalOrder = {
          ...existing,
          ...finalOrder,
          status: 'pending_approval',
          createdBy: currentUser.id,
          currentStepIndex: 0
        };
      } else {
        finalOrder.status = 'pending_approval';
        finalOrder.createdBy = currentUser?.id;
        finalOrder.currentStepIndex = 0;
      }
    }

    if (finalOrder.companyId != null) finalOrder.companyId = String(finalOrder.companyId);

    if (!finalOrder.id) {
      finalOrder.id = nextOrderId(data.orders);
      finalOrder.orderDate = finalOrder.orderDate || new Date().toISOString().split('T')[0];
    }
    setData(prev => {
      let orders = [...prev.orders];
      const exists = orders.some(o => o.id === finalOrder.id);
      if (exists) {
        orders = orders.map(o => o.id === finalOrder.id ? { ...o, ...finalOrder } : o);
      } else {
        orders.unshift(finalOrder);
      }
      return { ...prev, orders };
    });
    await saveOrderToSupabase(finalOrder);
    if (Array.isArray(finalOrder.stlFiles) && finalOrder.stlFiles.length > 0) {
      const fileIds = finalOrder.stlFiles.map(f => f.id).filter(Boolean);
      await linkFilesToOrderInSupabase(finalOrder.id, fileIds);
    }
    showToast(`İş emri #${finalOrder.id} kaydedildi.`);
    return finalOrder;
  };

  const uploadOrderStlFile = async (orderId, file) => {
    try {
      showToast(`${file.name} yükleniyor...`, 'info');
      const savedRecord = await uploadStlToSupabase(file, orderId);
      setData(prev => {
        const orders = prev.orders.map(o => {
          if (o.id !== orderId) return o;
          const currentFiles = o.stlFiles || [];
          return {
            ...o,
            stlFiles: [savedRecord, ...currentFiles.filter(f => f.id !== savedRecord.id)]
          };
        });
        return { ...prev, orders };
      });
      showToast(`✓ ${file.name} başarıyla yüklendi!`, 'success');
      return savedRecord;
    } catch (err) {
      console.error('uploadOrderStlFile error:', err);
      showToast(err.message || 'STL dosyası yüklenemedi.', 'error');
      throw err;
    }
  };

  const deleteOrderStlFile = async (orderId, fileId, fileUrl) => {
    try {
      await deleteStlFromSupabase(fileId, fileUrl);
      setData(prev => {
        const orders = prev.orders.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            stlFiles: (o.stlFiles || []).filter(f => f.id !== fileId)
          };
        });
        return { ...prev, orders };
      });
      showToast('STL dosyası silindi.', 'warning');
      return true;
    } catch (err) {
      console.error('deleteOrderStlFile error:', err);
      showToast('Dosya silinirken hata oluştu.', 'error');
      return false;
    }
  };

  const approveOrder = (orderId, completedDate = '') => {
    if (denyProductionChange()) return;
    const dateValue = completedDate || new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const steps = (o.steps || []).map((step, idx) => {
          if (idx === 0) {
            return {
              ...step,
              status: 'completed',
              completedAt: now,
              completedDate: dateValue
            };
          }
          if (idx === 1) {
            return { ...step, status: 'in_progress', startedAt: step.startedAt || now };
          }
          return step;
        });
        changedOrder = {
          ...o,
          status: 'in_progress',
          currentStepIndex: Math.min(1, Math.max(0, steps.length - 1)),
          steps
        };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('İş emri onaylandı ve üretim hattına alındı.', 'success');
  };

  const rejectOrder = (orderId) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        changedOrder = { ...o, status: 'rejected' };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('İş emri reddedildi.', 'warning');
  };

  const addStepToOrder = (orderId, newStepName, newStepDesc = '', technician = '') => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const steps = [...(o.steps || [])];
        const newOrderNum = steps.length + 1;
        steps.push({
          order: newOrderNum,
          name: newStepName,
          description: newStepDesc || 'Özel laboratuvar aşaması',
          status: 'pending',
          technician: technician || 'Yusuf Usta',
          notes: ''
        });
        changedOrder = { ...o, steps };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('Yeni aşama iş emrine eklendi!', 'success');
  };

  const removeStepFromOrder = (orderId, stepIndex) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        let steps = (o.steps || []).filter((_, idx) => idx !== stepIndex);
        steps = steps.map((s, idx) => ({ ...s, order: idx + 1 }));
        const curIdx = Math.min(o.currentStepIndex, Math.max(0, steps.length - 1));
        changedOrder = { ...o, steps, currentStepIndex: curIdx };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('Aşama çıkarıldı.', 'warning');
  };

  const editStepInOrder = (orderId, stepIndex, updatedData) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const steps = [...(o.steps || [])];
        if (steps[stepIndex]) {
          steps[stepIndex] = { ...steps[stepIndex], ...updatedData };
        }
        changedOrder = { ...o, steps };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('Aşama güncellendi.', 'success');
  };

  const updateStepStatus = (orderId, stepIndex, newStatus, technician = '', notes = '', completedDate = '') => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const updated = { ...o, steps: [...o.steps] };
        const step = { ...updated.steps[stepIndex] };
        step.status = newStatus;
        if (technician) step.technician = technician;
        if (notes) step.notes = notes;

        const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

        if (newStatus === 'in_progress') {
          step.startedAt = now;
          updated.status = 'in_progress';
          updated.currentStepIndex = stepIndex;
        } else if (newStatus === 'completed') {
          step.completedAt = now;
          step.completedDate = completedDate || new Date().toISOString().split('T')[0];
          if (step.name === 'Onay' || o.status === 'pending_approval') {
            updated.status = 'in_progress';
          }
          if (stepIndex + 1 < updated.steps.length) {
            updated.currentStepIndex = stepIndex + 1;
            if (updated.steps[stepIndex + 1].status === 'pending') {
              updated.steps[stepIndex + 1] = {
                ...updated.steps[stepIndex + 1],
                status: 'in_progress',
                startedAt: now
              };
            }
          } else {
            updated.status = 'completed';
          }
        } else if (newStatus === 'revision') {
          step.revisionAt = now;
          updated.status = 'revision';
        }

        updated.steps[stepIndex] = step;
        changedOrder = updated;
        return updated;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('Aşama durumu güncellendi.');
  };

  const advanceOrderToNextStep = (orderId, completedDate = '') => {
    if (denyProductionChange()) return;
    const order = data.orders.find(o => o.id === orderId);
    if (!order || !order.steps) return;
    const curIdx = order.currentStepIndex || 0;
    const current = order.steps[curIdx];
    if (current?.name === 'Onay' || order.status === 'pending_approval') {
      approveOrder(orderId, completedDate);
      return;
    }
    updateStepStatus(orderId, curIdx, 'completed', current?.technician || '', current?.notes || '', completedDate);
  };

  const convertImplantToMdp = (implantOrderId, completedDate = '') => {
    if (denyProductionChange()) return null;
    const implant = data.orders.find(o => o.id === implantOrderId);
    if (!implant || implant.materialId !== 'implant') return null;

    const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    const today = completedDate || new Date().toISOString().split('T')[0];

    const completedImplant = {
      ...implant,
      status: 'completed',
      currentStepIndex: Math.max(0, (implant.steps || []).length - 1),
      steps: (implant.steps || []).map((step, idx, arr) => ({
        ...step,
        status: 'completed',
        completedAt: step.completedAt || (idx === arr.length - 1 ? now : step.completedAt),
        completedDate: step.completedDate || (idx === arr.length - 1 ? today : step.completedDate)
      }))
    };

    const template = DEFAULT_MATERIALS.mdp;
    const mdpSteps = template.steps.map((s, idx) => ({
      order: s.order,
      name: s.name,
      description: s.description,
      status: idx === 0 ? 'completed' : (idx === 1 ? 'in_progress' : 'pending'),
      technician: s.defaultTechnician || 'Yusuf Usta',
      startedAt: idx === 1 ? now : null,
      completedAt: idx === 0 ? now : null,
      completedDate: idx === 0 ? today : null,
      notes: ''
    }));

    const newId = nextOrderId(data.orders);

    const implantNote = `${IMPLANT_COMPLETED_LABEL} (Kaynak iş emri: #${implant.id})`;
    const mdpOrder = {
      id: newId,
      companyId: implant.companyId != null ? String(implant.companyId) : implant.companyId,
      doctorId: implant.doctorId,
      patientId: implant.patientId,
      materialId: 'mdp',
      teeth: implant.teeth || [],
      shade: implant.shade || 'A2',
      priority: implant.priority || 'normal',
      status: 'in_progress',
      createdBy: implant.createdBy || null,
      orderDate: today,
      trialDate: implant.trialDate || '',
      deliveryDate: implant.deliveryDate || today,
      price: implant.price || 0,
      notes: implant.notes ? `${implantNote}\n${implant.notes}` : implantNote,
      currentStepIndex: 1,
      steps: mdpSteps,
      fromImplantId: implant.id,
      implantCompleted: true
    };

    setData(prev => {
      const orders = prev.orders.map(o => o.id === implant.id ? completedImplant : o);
      orders.unshift(mdpOrder);
      return { ...prev, orders };
    });
    saveOrderToSupabase(completedImplant);
    saveOrderToSupabase(mdpOrder);
    showToast(`İmplant bitti. MDP iş emri #${newId} oluşturuldu.`, 'success');
    return mdpOrder;
  };

  const convertImplantToPorcelain = convertImplantToMdp;

  const regressOrderToPrevStep = (orderId) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const curIdx = o.currentStepIndex || 0;
        if (curIdx <= 0) return o;
        const prevIdx = curIdx - 1;
        const updatedSteps = (o.steps || []).map((step, idx) => {
          if (idx === prevIdx) {
            return { ...step, status: 'in_progress', completedAt: null };
          } else if (idx >= curIdx) {
            return { ...step, status: 'pending', completedAt: null, startedAt: null };
          }
          return step;
        });
        changedOrder = {
          ...o,
          status: 'in_progress',
          currentStepIndex: prevIdx,
          steps: updatedSteps
        };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('İş emri bir önceki aşamaya geri alındı.', 'warning');
  };

  const moveOrderToStep = (orderId, targetStepIndex, completedDate = '') => {
    if (denyProductionChange()) return;
    const dateValue = completedDate || new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const curIdx = o.currentStepIndex || 0;
        const steps = (o.steps || []).map((step, idx) => {
          if (idx < targetStepIndex) {
            return {
              ...step,
              status: 'completed',
              completedAt: step.completedAt || now,
              completedDate: idx >= curIdx ? dateValue : (step.completedDate || dateValue)
            };
          } else if (idx === targetStepIndex) {
            return { ...step, status: 'in_progress', startedAt: step.startedAt || now };
          } else {
            return { ...step, status: 'pending', completedAt: null, startedAt: null, completedDate: null };
          }
        });
        const leavingOnay = (o.steps || [])[0]?.name === 'Onay' && targetStepIndex > 0;
        changedOrder = {
          ...o,
          status: targetStepIndex >= steps.length ? 'completed' : (leavingOnay || o.status === 'pending_approval' ? 'in_progress' : (targetStepIndex > 0 ? 'in_progress' : o.status)),
          currentStepIndex: Math.min(targetStepIndex, steps.length - 1),
          steps
        };
        if (changedOrder.status === 'pending_approval' && targetStepIndex > 0) {
          changedOrder.status = 'in_progress';
        }
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('İş emri istasyonu güncellendi.');
  };

  const restartOrder = (orderId, targetStepIndex = 0, restartReason = '') => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;

        const updatedSteps = (o.steps || []).map((step, idx) => {
          if (idx < targetStepIndex) {
            return step;
          } else if (idx === targetStepIndex) {
            return {
              ...step,
              status: 'in_progress',
              startedAt: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
              notes: restartReason ? `[Yeniden Başlatıldı: ${restartReason}] ${step.notes || ''}` : step.notes
            };
          } else {
            return {
              ...step,
              status: 'pending',
              completedAt: null
            };
          }
        });

        changedOrder = {
          ...o,
          status: 'in_progress',
          currentStepIndex: targetStepIndex,
          steps: updatedSteps,
          notes: restartReason ? `[Revizyon/Yeniden Başlatma: ${restartReason}] ${o.notes || ''}` : o.notes
        };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast(`İş emri üretime geri döndürüldü ve ${targetStepIndex + 1}. aşamadan yeniden başlatıldı!`, 'success');
  };

  const deleteOrder = (id) => {
    if (denyProductionChange()) return;
    setData(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
    deleteOrderFromSupabase(id);
    showToast('İş emri silindi.', 'warning');
  };

  // Teknisyen Ekleme / Çıkarma / Düzenleme
  const addTechnician = (name, role = 'Dental Teknisyen') => {
    if (denyProductionChange()) return;
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (techniciansList.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`"${trimmed}" zaten ekipte kayıtlı.`, 'warning');
      return;
    }
    const newTech = {
      id: 'tech-' + Date.now(),
      name: trimmed,
      role: role.trim() || 'Dental Teknisyen'
    };
    setTechniciansList(prev => [...prev, newTech]);
    showToast(`Teknisyen "${trimmed}" başarıyla eklendi!`, 'success');
    return newTech;
  };

  const removeTechnician = (techIdOrName) => {
    setTechniciansList(prev => prev.filter(t => t.id !== techIdOrName && t.name !== techIdOrName));
    showToast('Teknisyen ekipten çıkarıldı.', 'info');
  };

  const updateTechnician = (techId, updatedData) => {
    setTechniciansList(prev => prev.map(t => t.id === techId ? { ...t, ...updatedData } : t));
    showToast('Teknisyen güncellendi.', 'success');
  };

  // Belirli bir iş emrinin aşamasına sorumlu teknisyen atama
  const assignTechnicianToStep = (orderId, stepIndex, technician) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const updated = { ...o, steps: [...(o.steps || [])] };
        if (updated.steps[stepIndex]) {
          updated.steps[stepIndex] = {
            ...updated.steps[stepIndex],
            technician: technician
          };
        }
        changedOrder = updated;
        return updated;
      });

      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast(`Sorumlu teknisyen "${technician}" olarak güncellendi.`, 'success');
  };

  const updateOrderDates = (orderId, dates) => {
    if (denyProductionChange()) return;
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        changedOrder = { ...o, ...dates };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('Tarih güncellendi.', 'success');
  };

  // Küçük Tamamlandı Kutucuğu: Tek tıkla aşamayı tamamla veya geri al
  const toggleStepCompletion = (orderId, stepIndex) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order || !order.steps || !order.steps[stepIndex]) return;
    const currentStatus = order.steps[stepIndex].status;
    if (currentStatus === 'completed') {
      updateStepStatus(orderId, stepIndex, 'in_progress');
      showToast('Aşama tekrar işlemde olarak işaretlendi.', 'info');
    } else {
      updateStepStatus(orderId, stepIndex, 'completed');
      showToast('✓ Aşama tamamlandı!', 'success');
    }
  };

  const saveCompany = (comp) => {
    let savedObj = { ...comp };
    if (!savedObj.id) {
      savedObj.id = 'comp-' + Date.now();
      savedObj.createdAt = new Date().toISOString().split('T')[0];
    }
    savedObj.id = String(savedObj.id);
    setData(prev => {
      let companies = [...prev.companies];
      const exists = companies.some(c => c.id === savedObj.id);
      if (exists) {
        companies = companies.map(c => c.id === savedObj.id ? { ...c, ...savedObj } : c);
      } else {
        companies.unshift(savedObj);
      }
      return { ...prev, companies };
    });
    saveCompanyToSupabase(savedObj);
    showToast(comp.id ? 'Klinik güncellendi.' : 'Klinik kaydedildi.');
    return savedObj;
  };

  const deleteCompany = (id) => {
    setData(prev => ({ ...prev, companies: prev.companies.filter(c => c.id !== id) }));
    deleteCompanyFromSupabase(id);
    showToast('Klinik silindi.', 'warning');
  };

  const saveDoctor = async (doc) => {
    let savedObj = { ...doc };
    if (!savedObj.id) {
      savedObj.id = 'doc-' + Date.now();
      savedObj.createdAt = new Date().toISOString().split('T')[0];
    }
    setData(prev => {
      let doctors = [...prev.doctors];
      const exists = doctors.some(d => d.id === savedObj.id);
      if (exists) {
        doctors = doctors.map(d => d.id === savedObj.id ? { ...d, ...savedObj } : d);
      } else {
        doctors.unshift(savedObj);
      }
      return { ...prev, doctors };
    });
    await saveDoctorToSupabase(savedObj);
    showToast('Hekim kaydedildi.');
    return savedObj;
  };

  const deleteDoctor = (id) => {
    setData(prev => ({ ...prev, doctors: prev.doctors.filter(d => d.id !== id) }));
    deleteDoctorFromSupabase(id);
    showToast('Hekim silindi.', 'warning');
  };

  const savePatient = async (pat) => {
    let savedObj = { ...pat };
    if (!savedObj.id) {
      savedObj.id = 'pat-' + Date.now();
      savedObj.createdAt = new Date().toISOString().split('T')[0];
    }
    setData(prev => {
      let patients = [...prev.patients];
      const exists = patients.some(p => p.id === savedObj.id);
      if (exists) {
        patients = patients.map(p => p.id === savedObj.id ? { ...p, ...savedObj } : p);
      } else {
        patients.unshift(savedObj);
      }
      return { ...prev, patients };
    });
    await savePatientToSupabase(savedObj);
    showToast('Hasta kaydedildi.');
    return savedObj;
  };

  const deletePatient = (id) => {
    setData(prev => ({ ...prev, patients: prev.patients.filter(p => p.id !== id) }));
    deletePatientFromSupabase(id);
    showToast('Hasta silindi.', 'warning');
  };

  const scopedCompanies = useMemo(() => {
    const all = data.companies || [];
    if (!isCompany) return all;
    if (!currentUser?.companyId) return [];
    return all.filter(c => idsMatch(c.id, currentUser.companyId));
  }, [data.companies, isCompany, currentUser]);

  const scopedDoctors = useMemo(() => {
    const all = data.doctors || [];
    if (!isCompany) return all;
    if (!currentUser?.companyId) return [];
    return all.filter(d => idsMatch(d.companyId, currentUser.companyId));
  }, [data.doctors, isCompany, currentUser]);

  const scopedPatients = useMemo(() => {
    const all = data.patients || [];
    if (!isCompany) return all;
    if (!currentUser?.companyId) return [];
    return all.filter(p => idsMatch(p.companyId, currentUser.companyId));
  }, [data.patients, isCompany, currentUser]);

  const scopedOrders = useMemo(() => {
    const all = data.orders || [];
    if (isCompany) {
      const cid = currentUser?.companyId;
      if (!cid) return [];
      return all.filter(o => orderBelongsToCompany(o, cid, data.patients, data.doctors));
    }
    if (isOperator && currentUser?.id) return all.filter(o => o.createdBy === currentUser.id);
    return all;
  }, [data.orders, data.patients, data.doctors, isCompany, isOperator, currentUser]);

  return (
    <DentalContext.Provider
      value={{
        orders: scopedOrders,
        companies: scopedCompanies,
        doctors: scopedDoctors,
        patients: scopedPatients,
        materials: DEFAULT_MATERIALS,
        vitaShades: VITA_SHADES,
        technicians: techniciansList.map(t => t.name),
        techniciansList,
        addTechnician,
        removeTechnician,
        updateTechnician,
        assignTechnicianToStep,
        updateOrderDates,
        toggleStepCompletion,
        isTeamModalOpen,
        setIsTeamModalOpen,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        isOrderModalOpen,
        setIsOrderModalOpen,
        editingOrder,
        setEditingOrder,
        isDbModalOpen,
        setIsDbModalOpen,
        dbConfig,
        saveDbConfig,
        dbStatus,
        isDbLoading,
        testAndSyncDb,
        clearAllData,
        exportData,
        importData,
        saveOrder,
        uploadOrderStlFile,
        deleteOrderStlFile,
        approveOrder,
        rejectOrder,
        addStepToOrder,
        removeStepFromOrder,
        editStepInOrder,
        updateStepStatus,
        advanceOrderToNextStep,
        convertImplantToPorcelain,
        convertImplantToMdp,
        regressOrderToPrevStep,
        moveOrderToStep,
        restartOrder,
        deleteOrder,
        saveCompany,
        deleteCompany,
        saveDoctor,
        deleteDoctor,
        savePatient,
        deletePatient
      }}
    >
      {children}
    </DentalContext.Provider>
  );
};

export const useDental = () => useContext(DentalContext);
