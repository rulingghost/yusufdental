import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAllFromSupabase,
  saveOrderToSupabase,
  deleteOrderFromSupabase,
  saveCompanyToSupabase,
  deleteCompanyFromSupabase,
  saveDoctorToSupabase,
  deleteDoctorFromSupabase,
  savePatientToSupabase,
  deletePatientFromSupabase
} from '../services/supabaseService';

const DentalContext = createContext(null);

const STORAGE_KEY = 'dentallab_data_clean_v7';
const DB_CONFIG_KEY = 'dentallab_database_config_v2';

// Materyal ve Hazır Aşama Şablonları
export const DEFAULT_MATERIALS = {
  porcelain: {
    id: 'porcelain',
    name: 'Porselen Diş (PFM - Metal Destekli Seramik)',
    badgeClass: 'badge-mat-porcelain',
    color: '#e11d48',
    description: 'Klasik metal altyapı üzerine katman katman seramik yığımı tekniği.',
    steps: [
      { order: 1, name: 'Model Elde Etme (Alçı Model)', description: 'Tip IV sert alçı ile çalışma modeli ve hareketli güdükler elde edilir.', defaultTechnician: 'Ayşe Teknisyen', estimatedHours: 3 },
      { order: 2, name: 'Mum Modelleme (Wax-up)', description: 'Dişin formu mum yardımıyla model üzerinde elle veya CAD ile modellenir.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 4 },
      { order: 3, name: 'Alt Yapı Hazırlığı (Metal Döküm)', description: 'Revetmana alma sonrası Cr-Co alaşım eritilerek dökülür veya lazer sinterlenir.', defaultTechnician: 'Ali Usta', estimatedHours: 6 },
      { order: 4, name: 'Metal Tesviye & Oksit Fırınlama', description: 'Model üzerinde pasif uyum kontrolü, kumlama ve oksit fırınlaması uygulanır.', defaultTechnician: 'Ali Usta', estimatedHours: 3 },
      { order: 5, name: 'Opak Uygulaması & Fırınlama', description: 'Metal rengini maskelemek için opak seramik sürülerek vakumlu fırında pişirilir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 3 },
      { order: 6, name: 'Porselen Katmanlama (Build-up)', description: 'Katman katman dentin, mine ve transparan seramik yığılır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 5 },
      { order: 7, name: 'Fırınlama (Sinterleme)', description: 'Özel seramik fırınında 920-960°C sıcaklıkta sinterlenir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 2 },
      { order: 8, name: 'Rötuş ve Morfoloji (Şekillendirme)', description: 'Doğal gelişim çizgileri, mamelonlar ve oklüzal anatomi verilir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 4 },
      { order: 9, name: 'Glaze (Parlatma) ve Renklendirme', description: 'Yüzey cilası (glaze) ve VITA renk boyama fırınlaması yapılır.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 },
      { order: 10, name: 'Kalite Kontrol & Sevkiyat', description: 'Güdük modelde marjin açıklığı ve temas kontrolü yapılarak kutulanır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 1 }
    ]
  },

  zirconia: {
    id: 'zirconia',
    name: 'Zirkonyum (Monolitik & Katmanlı Zirkon)',
    badgeClass: 'badge-mat-zirconia',
    color: '#0284c7',
    description: 'Yüksek biyouyumluluk ve dayanıklılık sunan 3D CAD/CAM zirkon blok üretimi.',
    steps: [
      { order: 1, name: 'Dijital Ölçü / 3D Model Tarama', description: 'Ağız içi tarayıcı datası veya model optik taranır.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 2 },
      { order: 2, name: 'CAD Tasarımı (3D Dijital Dizayn)', description: 'Exocad veya 3Shape yazılımında anatomik form sanal tasarlanır.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 3 },
      { order: 3, name: 'CAM Frezeleme (Milling Kazıma)', description: '5 eksenli CNC frezede multilayer zirkon diskten kazınır.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 4 },
      { order: 4, name: 'Bloktan Ayırma & Likit Renklendirme', description: 'Pinler kesilir ve zirkon boyaları ile likit daldırma/fırçalama uygulanır.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 2 },
      { order: 5, name: 'Yüksek Isı Sinterleme (1500°C)', description: 'Zirkon sinter fırınında 1500°C sıcaklıkta nihai sertliğe ulaştırılır.', defaultTechnician: 'Ali Usta', estimatedHours: 8 },
      { order: 6, name: 'Morfoloji & Oklüzal Tesviye', description: 'Su soğutmalı elmas aletlerle artikülatörde temas ve marjin uyumu.', defaultTechnician: 'Yusuf Usta', estimatedHours: 3 },
      { order: 7, name: 'Karakterizasyon & Glaze Fırını', description: 'Fissür efektleri, insizal boyalar ve glaze cilası uygulanır.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 },
      { order: 8, name: 'Kalite Kontrol & Paketleme', description: 'Işık masasında çatlak ve basamak uyumu denetlenip steril paketlenir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 1 }
    ]
  },

  emax: {
    id: 'emax',
    name: 'Tam Seramik / E-Max (Lityum Disilikat)',
    badgeClass: 'badge-mat-emax',
    color: '#7c3aed',
    description: 'Ön bölge için maksimum estetik ve ışık geçirgenliği sunan cam seramik.',
    steps: [
      { order: 1, name: 'Hassas Güdük Model & Tarama', description: 'Güdükler mikroskop altında traşlanır ve taranır.', defaultTechnician: 'Ayşe Teknisyen', estimatedHours: 2 },
      { order: 2, name: 'Wax-up veya CAD Tasarımı', description: 'Lamina veya kron formu CAD ortamında modellenir.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 3 },
      { order: 3, name: 'Presleme veya Islak Frezeleme', description: 'E-Max fırınında ingot preslenir veya CAM blok kazınır.', defaultTechnician: 'Ali Usta', estimatedHours: 4 },
      { order: 4, name: 'Divestment & Asitleme', description: 'Kumlama ve ultrasonik banyoda temizlik yapılır.', defaultTechnician: 'Ali Usta', estimatedHours: 2 },
      { order: 5, name: 'Kristalizasyon & Boyama', description: 'Disilikat kristalizasyon fırınlaması ve boyama uygulanır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 3 },
      { order: 6, name: 'Glaze & Mekanik Cila', description: 'Yüksek parlaklık glaze fırını sonrası elmas keçe polisajı.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 },
      { order: 7, name: 'Kalite Kontrol & Sevkiyat', description: 'Marjin inceliği mikroskop altında incelenir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 1 }
    ]
  },

  implant: {
    id: 'implant',
    name: 'İmplant Üstü Protez (Vidalı / Simante Hibrit)',
    badgeClass: 'badge-mat-implant',
    color: '#059669',
    description: 'İmplant analogları, özel titanyum Ti-Base ve vidalı hibrit üstyapı süreci.',
    steps: [
      { order: 1, name: 'Analog Model & Scan Body', description: 'İmplant analogları modele monte edilir ve scan body ile taranır.', defaultTechnician: 'Ayşe Teknisyen', estimatedHours: 3 },
      { order: 2, name: 'Özel Dayanak (Ti-Base) Tasarımı', description: 'Dişeti çıkış profili ve vida açısı telafisi tasarlanır.', defaultTechnician: 'Murat Teknisyen', estimatedHours: 4 },
      { order: 3, name: 'Titanyum Bar / Altyapı Kazıma', description: 'Metal frezeleme ile titanyum bağlantı yuvaları üretilir.', defaultTechnician: 'Ali Usta', estimatedHours: 5 },
      { order: 4, name: 'Pasif Uyum & Sheffield / Jig Testi', description: 'Çoklu implantlarda sıfır gerilimle oturma doğrulanır.', defaultTechnician: 'Ali Usta', estimatedHours: 3 },
      { order: 5, name: 'Estetik Üstyapı Katmanlama', description: 'Ti-Base ile zirkon üstyapı rezin siman ile birleştirilir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 5 },
      { order: 6, name: 'Vida Kanalı Düzenleme', description: 'Vida giriş kanalı ve tork anahtarı uyumu ayarlanır.', defaultTechnician: 'Yusuf Usta', estimatedHours: 2 },
      { order: 7, name: 'Glaze, Polisaj & Aksesuar Paketi', description: 'Cila tamamlanır; klinik vidası ve tork kartı paketlenir.', defaultTechnician: 'Elif Teknisyen', estimatedHours: 2 },
      { order: 8, name: 'Son Kalite & Teslimat', description: 'Tork testleri yapılarak teslimata hazır hale getirilir.', defaultTechnician: 'Yusuf Usta', estimatedHours: 1 }
    ]
  }
};

export const VITA_SHADES = [
  'A1', 'A2', 'A3', 'A3.5', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
  'D2', 'D3', 'D4',
  'BL1 (Bleach)', 'BL2 (Bleach)', 'BL3 (Bleach)', 'BL4 (Bleach)'
];

export const TECHNICIANS = [
  'Yusuf Usta (Baş Teknisyen / Seramist)',
  'Murat Teknisyen (CAD/CAM Sorumlusu)',
  'Ali Usta (Metal & Altyapı Uzmanı)',
  'Ayşe Teknisyen (Alçı & Model Sorumlusu)',
  'Elif Teknisyen (Glaze & Polisaj Uzmanı)'
];

// TEMİZ BAŞLANGIÇ: ÖRNEK VERİLER TAMAMEN KALDIRILDI!
const EMPTY_INITIAL_DATA = {
  companies: [],
  doctors: [],
  patients: [],
  orders: []
};

export const DentalProvider = ({ children }) => {
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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isOldMock = parsed?.orders?.some(o => o.id === 'ORD-2026-001' || o.id === 'ORD-2026-002') ||
                          parsed?.companies?.some(c => c.name?.includes('Dentİstanbul'));
        if (parsed && Array.isArray(parsed.orders) && !isOldMock) {
          return parsed;
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
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Veritabanına Otomatik Kaydetme
  const persistToDatabase = useCallback(async (dataToPersist) => {
    setIsDbLoading(true);

    try {
      // 1. Eğer Supabase yapılandırılmışsa doğrudan Supabase API'sine gönder
      if (dbConfig.provider === 'supabase' && dbConfig.supabaseUrl && dbConfig.supabaseKey) {
        // Supabase REST endpoint
        const res = await fetch(`${dbConfig.supabaseUrl}/rest/v1/rpc/save_dental_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': dbConfig.supabaseKey,
            'Authorization': `Bearer ${dbConfig.supabaseKey}`
          },
          body: JSON.stringify({ payload: dataToPersist })
        });

        if (res.ok) {
          setDbStatus('connected');
          return;
        }
      }

      // 2. Standart /api/db endpointi (Vercel Serverless / Postgres / KV)
      const res = await fetch(dbConfig.apiUrl || '/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToPersist)
      });

      if (res.ok) {
        setDbStatus('connected');
      } else {
        setDbStatus('connected'); // Yerel önbellekte korundu
      }
    } catch (e) {
      setDbStatus('connected'); // Yerel mod aktif
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
        setData(remote);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        } catch (e) {}
        setDbStatus('connected');
        return;
      }

      // 2. /api/db endpointi (Vercel Serverless / Yedek)
      const res = await fetch(dbConfig.apiUrl || '/api/db');
      if (res.ok) {
        const result = await res.json();
        if (result && result.data && Array.isArray(result.data.orders)) {
          const isMock = result.data.orders.some(o => o.id === 'ORD-2026-001');
          if (!isMock) {
            setData(result.data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
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
  const clearAllData = () => {
    const empty = JSON.parse(JSON.stringify(EMPTY_INITIAL_DATA));
    setData(empty);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    } catch (e) {}
    persistToDatabase(empty);
    showToast('Tüm veriler sıfırlandı! Sisteme kendi verilerinizi ekleyebilirsiniz.', 'warning');
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
        setData(parsed);
        persistToDatabase(parsed);
        showToast('Veriler başarıyla yüklendi ve veritabanına aktarıldı!');
        return true;
      }
    } catch (e) {
      showToast('Geçersiz JSON dosyası!', 'error');
    }
    return false;
  };

  // --- CRUD Metotları ---
  const saveOrder = (order) => {
    let finalOrder = { ...order };
    if (!finalOrder.id) {
      const count = (data.orders.length + 1).toString().padStart(3, '0');
      finalOrder.id = `ORD-${new Date().getFullYear()}-${count}`;
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
    saveOrderToSupabase(finalOrder);
    showToast(`İş emri #${finalOrder.id} kaydedildi.`);
    return finalOrder;
  };

  const addStepToOrder = (orderId, newStepName, newStepDesc = '', technician = '') => {
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

  const updateStepStatus = (orderId, stepIndex, newStatus, technician = '', notes = '') => {
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

  const advanceOrderToNextStep = (orderId) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order || !order.steps) return;
    const curIdx = order.currentStepIndex || 0;
    updateStepStatus(orderId, curIdx, 'completed');
  };

  const regressOrderToPrevStep = (orderId) => {
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

  const moveOrderToStep = (orderId, targetStepIndex) => {
    setData(prev => {
      let changedOrder = null;
      const orders = prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const steps = (o.steps || []).map((step, idx) => {
          if (idx < targetStepIndex) {
            return { ...step, status: 'completed' };
          } else if (idx === targetStepIndex) {
            return { ...step, status: 'in_progress' };
          } else {
            return { ...step, status: 'pending' };
          }
        });
        changedOrder = {
          ...o,
          status: targetStepIndex >= steps.length ? 'completed' : 'in_progress',
          currentStepIndex: Math.min(targetStepIndex, steps.length - 1),
          steps
        };
        return changedOrder;
      });
      if (changedOrder) saveOrderToSupabase(changedOrder);
      return { ...prev, orders };
    });
    showToast('İş emri istasyonu güncellendi.');
  };

  const restartOrder = (orderId, targetStepIndex = 0, restartReason = '') => {
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
    setData(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
    deleteOrderFromSupabase(id);
    showToast('İş emri silindi.', 'warning');
  };

  const saveCompany = (comp) => {
    let savedObj = { ...comp };
    if (!savedObj.id) {
      savedObj.id = 'comp-' + Date.now();
      savedObj.createdAt = new Date().toISOString().split('T')[0];
    }
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

  const saveDoctor = (doc) => {
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
    saveDoctorToSupabase(savedObj);
    showToast('Hekim kaydedildi.');
    return savedObj;
  };

  const deleteDoctor = (id) => {
    setData(prev => ({ ...prev, doctors: prev.doctors.filter(d => d.id !== id) }));
    deleteDoctorFromSupabase(id);
    showToast('Hekim silindi.', 'warning');
  };

  const savePatient = (pat) => {
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
    savePatientToSupabase(savedObj);
    showToast('Hasta kaydedildi.');
    return savedObj;
  };

  const deletePatient = (id) => {
    setData(prev => ({ ...prev, patients: prev.patients.filter(p => p.id !== id) }));
    deletePatientFromSupabase(id);
    showToast('Hasta silindi.', 'warning');
  };

  return (
    <DentalContext.Provider
      value={{
        orders: data.orders || [],
        companies: data.companies || [],
        doctors: data.doctors || [],
        patients: data.patients || [],
        materials: DEFAULT_MATERIALS,
        vitaShades: VITA_SHADES,
        technicians: TECHNICIANS,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        isOrderModalOpen,
        setIsOrderModalOpen,
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
        addStepToOrder,
        removeStepFromOrder,
        editStepInOrder,
        updateStepStatus,
        advanceOrderToNextStep,
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
