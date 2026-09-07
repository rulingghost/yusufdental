/**
 * DENTAL LAB PRO - Veri Modelleri, Hazır Aşama Şablonları & State Yöneticisi
 */

const STORAGE_KEY = 'dental_lab_pro_db_v1';

// Materyal ve Adım Adım Üretim Aşamaları Kütüphanesi
const DEFAULT_MATERIAL_PIPELINES = {
  porcelain: {
    id: 'porcelain',
    name: 'Porselen Diş (Metal Destekli Seramik / PFM)',
    badgeClass: 'badge-mat-porcelain',
    color: '#f43f5e',
    description: 'Klasik metal altyapı üzerine katman katman seramik yığımı tekniği.',
    steps: [
      {
        order: 1,
        name: 'Model Elde Etme (Alçı Model)',
        description: 'Kliniğe gelen silikon veya dijital ölçü üzerinden özel tip IV sert alçı kullanılarak dişin birebir çalışma modeli ve hareketli güdükleri (dowel pin) elde edilir.',
        defaultTechnician: 'Ayşe Teknisyen (Model/Alçı)',
        estimatedHours: 3
      },
      {
        order: 2,
        name: 'Mum Modelleme (Wax-up)',
        description: 'Klasik yöntemlerde dişin eksik formları mum yardımıyla model üzerinde elle şekillendirilir. Dijital sistemlerde ise CAD ile sanal mumlama yapılır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 4
      },
      {
        order: 3,
        name: 'Alt Yapı Hazırlığı (Metal Döküm / Lazer Sinter)',
        description: 'Revetmana alma sonrası indüksiyonlu döküm cihazında Cr-Co veya Ni-Cr alaşım eritilerek dökülür ya da lazer sinterleme ile metal altyapı oluşturulur.',
        defaultTechnician: 'Ali Usta (Metal/Döküm)',
        estimatedHours: 6
      },
      {
        order: 4,
        name: 'Metal Tesviye & Oksit Fırınlama',
        description: 'Metal altyapının model üzerinde marjin ve arayüz pasif uyum kontrolü yapılır, kumlanır ve seramik bağını güçlendirmek için oksit fırınlaması uygulanır.',
        defaultTechnician: 'Ali Usta (Metal/Döküm)',
        estimatedHours: 3
      },
      {
        order: 5,
        name: 'Opak Uygulaması & Fırınlama',
        description: 'Metal rengini maskelemek ve kimyasal bağlanmayı sağlamak için 1. ve 2. tabaka opak seramik sürülerek vakumlu seramik fırınında fırınlanır.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 3
      },
      {
        order: 6,
        name: 'Porselen Katmanlama (Build-up)',
        description: 'Hazırlanan altyapı üzerine porselen tozu ve modelaj likidi karıştırılarak katman katman dentin, mine ve şeffaf/transparan seramik yığılır.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 5
      },
      {
        order: 7,
        name: 'Fırınlama (Sinterleme)',
        description: 'Porselen katmanları özel vakumlu seramik fırınında 920-960°C sıcaklıkta fırınlanarak cam fazına geçirilir ve sertleştirilir.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 2
      },
      {
        order: 8,
        name: 'Rötuş ve Morfoloji (Şekillendirme)',
        description: 'Fırınlanan dişe elmas frezler yardımıyla doğal dişin mamelonları, gelişim olukları, mikro dokuları ve karşıt çeneyle oklüzal teması kazandırılır.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 4
      },
      {
        order: 9,
        name: 'Glaze (Parlatma) ve Renklendirme',
        description: 'Dişin doğal parlaklığını kazanması ve ağız içindeki diğer dişlerle renk uyumunun tam olması için yüzey cilası (glaze) ve VITA renk boyama fırınlaması yapılır.',
        defaultTechnician: 'Elif Teknisyen (Glaze)',
        estimatedHours: 2
      },
      {
        order: 10,
        name: 'Kalite Kontrol & Sevkiyat',
        description: 'Güdük modelde marjin açıklığı, kontak noktaları ve çatlak kontrolü yapılır. Dezenfekte edilerek klinik taşıma kutusuna yerleştirilir.',
        defaultTechnician: 'Yusuf Usta (Laboratuvar Şefi)',
        estimatedHours: 1
      }
    ]
  },

  zirconia: {
    id: 'zirconia',
    name: 'Zirkonyum (Monolitik & Katmanlı Zirkon)',
    badgeClass: 'badge-mat-zirconia',
    color: '#06b6d4',
    description: 'Yüksek biyouyumluluk ve dayanıklılık sunan 3D CAD/CAM zirkon blok üretimi.',
    steps: [
      {
        order: 1,
        name: 'Dijital Ölçü / 3D Model Tarama',
        description: 'Kliniğin ağız içi tarayıcı (IOS) datası sisteme alınır veya laboratuvar optik tarayıcısında alçı güdük model 3 boyutlu taranır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 2
      },
      {
        order: 2,
        name: 'CAD Tasarımı (3D Dijital Dizayn)',
        description: 'Exocad veya 3Shape yazılımında hastanın anatomik diş formu, marjin basamağı, tüberkülleri ve oklüzal dinamikleri sanal olarak tasarlanır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 3
      },
      {
        order: 3,
        name: 'CAM Frezeleme (Milling Kazıma)',
        description: 'Yüksek hassasiyetli 5 eksenli CNC kuru freze cihazında çok katmanlı (multilayer) zirkonyum diskten mikron hassasiyetinde kazınır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 4
      },
      {
        order: 4,
        name: 'Bloktan Ayırma & Likit Renklendirme',
        description: 'Destek pinleri kesilerek diş çıkarılır. Ham kireçsi zirkona özel renklendirme sıvıları (dentine boyaları) ile daldırma ve fırçalama uygulanır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 2
      },
      {
        order: 5,
        name: 'Yüksek Isı Sinterleme (1500°C)',
        description: 'Özel yüksek ısı zirkon sinter fırınında 8-10 saat boyunca 1500°C sıcaklıkta sinterlenerek zirkonun nihai %100 sertlik ve ışık geçirgenliğine kavuşması sağlanır.',
        defaultTechnician: 'Ali Usta (Fırın)',
        estimatedHours: 8
      },
      {
        order: 6,
        name: 'Morfoloji & Oklüzal Tesviye',
        description: 'Sinterden çıkan monolitik zirkon su soğutmalı elmas aletlerle artikülatörde temas ve marjin uyumuna getirilir.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 3
      },
      {
        order: 7,
        name: 'Karakterizasyon & Glaze Fırını',
        description: 'Doğal fissür efektleri, insizal şeffaflık boyaları ve yüzey glaze cilası uygulanarak 850°C fırınlanır.',
        defaultTechnician: 'Elif Teknisyen (Glaze)',
        estimatedHours: 2
      },
      {
        order: 8,
        name: 'Kalite Kontrol & Paketleme',
        description: 'Işık masasında mikro çatlak, translusens ve basamak uyumu denetlenir, steril poşetlenip kliniğe sevk edilir.',
        defaultTechnician: 'Yusuf Usta (Laboratuvar Şefi)',
        estimatedHours: 1
      }
    ]
  },

  emax: {
    id: 'emax',
    name: 'Tam Seramik / E-Max (Lityum Disilikat)',
    badgeClass: 'badge-mat-emax',
    color: '#8b5cf6',
    description: 'Ön bölge için maksimum estetik, ışık geçirgenliği ve doğal mine taklidi.',
    steps: [
      {
        order: 1,
        name: 'Hassas Güdük Model & Tarama',
        description: 'Güdükler mikroskop altında traşlanır, marjin çizgisi çizilir ve 3D optik taranır.',
        defaultTechnician: 'Ayşe Teknisyen (Model/Alçı)',
        estimatedHours: 2
      },
      {
        order: 2,
        name: 'Wax-up veya CAD Tasarımı',
        description: 'Lamina veya tam kron formu mumlanır veya CAD ortamında sıfır kalınlık geçişiyle dizayn edilir.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 3
      },
      {
        order: 3,
        name: 'Presleme veya Islak Frezeleme',
        description: 'E-Max press fırınında lityum disilikat külçe (ingot) 920°C basılır ya da CAM ıslak frezede bloktan kazınır.',
        defaultTechnician: 'Ali Usta (Döküm/Pres)',
        estimatedHours: 4
      },
      {
        order: 4,
        name: 'Divestment & Reaksiyon Katmanı Temizliği',
        description: 'Cam bilye kumlama ve özel Invex sıvısı ile ultrasonik banyoda reaksiyon tabakası mikro seviyede temizlenir.',
        defaultTechnician: 'Ali Usta (Döküm/Pres)',
        estimatedHours: 2
      },
      {
        order: 5,
        name: 'Kristalizasyon & Karakterizasyon Boyama',
        description: 'Mavi blok fazından disilikata dönüşüm fırınlaması yapılır ve mine çatlakları, floresans boyaları işlenir.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 3
      },
      {
        order: 6,
        name: 'Glaze & Mekanik Cila',
        description: 'Yüksek parlaklık glaze fırını sonrası elmas keçe polisajı uygulanır.',
        defaultTechnician: 'Elif Teknisyen (Glaze)',
        estimatedHours: 2
      },
      {
        order: 7,
        name: 'Kalite Kontrol & Sevkiyat',
        description: 'Özellikle marjin kenarlarının inceliği mikroskop altında incelenir ve silikon korumalı kutuya alınır.',
        defaultTechnician: 'Yusuf Usta (Laboratuvar Şefi)',
        estimatedHours: 1
      }
    ]
  },

  implant: {
    id: 'implant',
    name: 'İmplant Üstü Protez (Vidalı / Simante Hibrit)',
    badgeClass: 'badge-mat-implant',
    color: '#10b981',
    description: 'İmplant analogları, özel titanyum dayanak (Ti-Base) ve vidalı hibrit üstyapı süreci.',
    steps: [
      {
        order: 1,
        name: 'Analog Model & Tarama Gövdesi (Scan Body)',
        description: 'İmplant analogları alçı modele monte edilir, dişeti maskesi (gingiva) dökülür ve scan body parçalarıyla taranır.',
        defaultTechnician: 'Ayşe Teknisyen (Model/Alçı)',
        estimatedHours: 3
      },
      {
        order: 2,
        name: 'Özel Dayanak (Custom Ti-Base) CAD Tasarımı',
        description: 'Hastanın dişeti çıkış profili (emergence profile) ve vida açısı telafisi için 3D sanal dayanak tasarlanır.',
        defaultTechnician: 'Murat Teknisyen (CAD/CAM)',
        estimatedHours: 4
      },
      {
        order: 3,
        name: 'Titanyum Bar / Altyapı Kazıma',
        description: 'Metal frezeleme ile titanyum veya Co-Cr implant bağlantı yuvaları üretilir.',
        defaultTechnician: 'Ali Usta (Metal/Döküm)',
        estimatedHours: 5
      },
      {
        order: 4,
        name: 'Pasif Uyum & Sheffield / Jig Testi',
        description: 'Çoklu implantlarda sıfır gerilimle tam oturma (passive fit) doğrulanır, transfer jig hazırlanır.',
        defaultTechnician: 'Ali Usta (Metal/Döküm)',
        estimatedHours: 3
      },
      {
        order: 5,
        name: 'Estetik Üstyapı Katmanlama / Zirkon Hibritleme',
        description: 'Ti-Base ile zirkon veya porselen üstyapı kompozit rezin siman ile mikroskop altında kimyasal olarak birleştirilir.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 5
      },
      {
        order: 6,
        name: 'Vida Kanalı Düzenleme & Oklüzal Uyum',
        description: 'Vida giriş kanalı açısı kontrol edilir, oklüzal yüzey vidalama tork anahtarına göre ayarlanır.',
        defaultTechnician: 'Yusuf Usta (Seramist)',
        estimatedHours: 2
      },
      {
        order: 7,
        name: 'Glaze, Polisaj & Aksesuar Paketi',
        description: 'Parlatma tamamlanır; klinik transfer vidası, laboratuvar vidası ve tork değer kartı steril ambalajlanır.',
        defaultTechnician: 'Elif Teknisyen (Glaze)',
        estimatedHours: 2
      },
      {
        order: 8,
        name: 'Son Kalite & Teslimat',
        description: 'Tork testleri, marjin bütünlüğü incelenir ve kargo/kuryeye teslim edilir.',
        defaultTechnician: 'Yusuf Usta (Laboratuvar Şefi)',
        estimatedHours: 1
      }
    ]
  }
};

// VITA Renk Skalası
const VITA_SHADES = [
  'A1', 'A2', 'A3', 'A3.5', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
  'D2', 'D3', 'D4',
  'BL1 (Bleach)', 'BL2 (Bleach)', 'BL3 (Bleach)', 'BL4 (Bleach)'
];

// Teknisyenler
const TECHNICIANS = [
  'Yusuf Usta (Baş Teknisyen / Seramist)',
  'Murat Teknisyen (CAD/CAM Sorumlusu)',
  'Ali Usta (Metal & Altyapı Uzmanı)',
  'Ayşe Teknisyen (Alçı & Model Sorumlusu)',
  'Elif Teknisyen (Glaze & Polisaj Uzmanı)'
];

// Başlangıç Demo Verileri
const INITIAL_DATA = {
  companies: [
    {
      id: 'comp-1',
      name: 'DentArt Ağız ve Diş Sağlığı Polikliniği',
      contactPerson: 'Merve Hanım (Koordinatör)',
      phone: '+90 (212) 555 10 20',
      email: 'info@dentartklinik.com',
      address: 'Levent Mah. Çamlık Cad. No:14 Beşiktaş / İstanbul',
      balance: 14500,
      createdAt: '2026-01-10'
    },
    {
      id: 'comp-2',
      name: 'Gülüş Estetiği Diş Hastanesi',
      contactPerson: 'Cem Bey (Başhekim Yardımcısı)',
      phone: '+90 (216) 444 33 22',
      email: 'laboratuvar@gulusestetigi.com',
      address: 'Bağdat Cad. No:204 Kadıköy / İstanbul',
      balance: 28200,
      createdAt: '2026-02-01'
    },
    {
      id: 'comp-3',
      name: 'Nova Dental İmplantoloji Merkezi',
      contactPerson: 'Canan Güneş',
      phone: '+90 (312) 222 78 90',
      email: 'siparis@novadental.com',
      address: 'Tunalı Hilmi Cad. No:88 Çankaya / Ankara',
      balance: 8900,
      createdAt: '2026-02-15'
    }
  ],

  doctors: [
    {
      id: 'doc-1',
      companyId: 'comp-1',
      name: 'Dr. Dt. Mehmet Yılmaz',
      specialty: 'Protetik Diş Tedavisi Uzmanı (Protez)',
      phone: '+90 (532) 111 22 33',
      email: 'mehmet.yilmaz@dentartklinik.com'
    },
    {
      id: 'doc-2',
      companyId: 'comp-1',
      name: 'Dt. Zeynep Çelik',
      specialty: 'Genel Diş Hekimi & Estetik Gülüş',
      phone: '+90 (533) 444 55 66',
      email: 'zeynep.celik@dentartklinik.com'
    },
    {
      id: 'doc-3',
      companyId: 'comp-2',
      name: 'Dr. Dt. Ayşe Kaya',
      specialty: 'Ağız, Diş ve Çene Cerrahisi',
      phone: '+90 (535) 777 88 99',
      email: 'ayse.kaya@gulusestetigi.com'
    },
    {
      id: 'doc-4',
      companyId: 'comp-3',
      name: 'Dt. Kerem Demir',
      specialty: 'İmplantoloji ve Dijital Diş Hekimliği',
      phone: '+90 (542) 333 66 11',
      email: 'kerem.demir@novadental.com'
    }
  ],

  patients: [
    {
      id: 'pat-1',
      doctorId: 'doc-1',
      companyId: 'comp-1',
      name: 'Burak Korkmaz',
      chartNumber: 'PRT-9041',
      age: 34,
      gender: 'Erkek',
      notes: 'Bruksizm (diş sıkma) mevcut, kapanışa dikkat edilmeli.'
    },
    {
      id: 'pat-2',
      doctorId: 'doc-1',
      companyId: 'comp-1',
      name: 'Selin Öztürk',
      chartNumber: 'PRT-9042',
      age: 27,
      gender: 'Kadın',
      notes: 'Gülüş hattı yüksek, estetik zon mine parıltısı ön planda olmalı.'
    },
    {
      id: 'pat-3',
      doctorId: 'doc-3',
      companyId: 'comp-2',
      name: 'Ahmet Karaca',
      chartNumber: 'PRT-8820',
      age: 52,
      gender: 'Erkek',
      notes: 'Sağ alt implant üstü vidalı kron.'
    },
    {
      id: 'pat-4',
      doctorId: 'doc-4',
      companyId: 'comp-3',
      name: 'Fatma Aydın',
      chartNumber: 'PRT-7711',
      age: 46,
      gender: 'Kadın',
      notes: 'Ön bölge E-Max lamine veneer çalışması.'
    }
  ],

  orders: [
    {
      id: 'ORD-2026-001',
      companyId: 'comp-1',
      doctorId: 'doc-1',
      patientId: 'pat-1',
      materialId: 'porcelain',
      teeth: ['14', '15', '16'],
      shade: 'A2',
      priority: 'urgent', // normal, urgent, vip
      status: 'in_progress', // pending, in_progress, completed, revision
      orderDate: '2026-09-05',
      trialDate: '2026-09-08',
      deliveryDate: '2026-09-10',
      price: 6500,
      notes: '16 numaralı dişte oklüzal temas hafif bırakılsın.',
      currentStepIndex: 5, // 0-indexed: 5 = Porselen Katmanlama
      steps: [
        {
          order: 1,
          name: 'Model Elde Etme (Alçı Model)',
          status: 'completed',
          technician: 'Ayşe Teknisyen',
          completedAt: '2026-09-05 14:30',
          notes: 'Tip 4 alçı ile döküldü, güdükler temiz ayrıldı.'
        },
        {
          order: 2,
          name: 'Mum Modelleme (Wax-up)',
          status: 'completed',
          technician: 'Murat Teknisyen',
          completedAt: '2026-09-05 18:00',
          notes: 'Marjin sınırları 0.3mm bırakıldı.'
        },
        {
          order: 3,
          name: 'Alt Yapı Hazırlığı (Metal Döküm / Lazer Sinter)',
          status: 'completed',
          technician: 'Ali Usta',
          completedAt: '2026-09-06 11:15',
          notes: 'Cr-Co döküm başarılı, gözenek yok.'
        },
        {
          order: 4,
          name: 'Metal Tesviye & Oksit Fırınlama',
          status: 'completed',
          technician: 'Ali Usta',
          completedAt: '2026-09-06 14:00',
          notes: '980 derecede oksitlendi.'
        },
        {
          order: 5,
          name: 'Opak Uygulaması & Fırınlama',
          status: 'completed',
          technician: 'Yusuf Usta',
          completedAt: '2026-09-06 17:30',
          notes: '2 kat opak atıldı, metal parlaması tamamen kapandı.'
        },
        {
          order: 6,
          name: 'Porselen Katmanlama (Build-up)',
          status: 'in_progress',
          technician: 'Yusuf Usta',
          startedAt: '2026-09-07 09:00',
          notes: 'A2 dentin ve transparan mine katmanı yığılıyor.'
        },
        {
          order: 7,
          name: 'Fırınlama (Sinterleme)',
          status: 'pending',
          technician: 'Yusuf Usta'
        },
        {
          order: 8,
          name: 'Rötuş ve Morfoloji (Şekillendirme)',
          status: 'pending',
          technician: 'Yusuf Usta'
        },
        {
          order: 9,
          name: 'Glaze (Parlatma) ve Renklendirme',
          status: 'pending',
          technician: 'Elif Teknisyen'
        },
        {
          order: 10,
          name: 'Kalite Kontrol & Sevkiyat',
          status: 'pending',
          technician: 'Yusuf Usta'
        }
      ]
    },

    {
      id: 'ORD-2026-002',
      companyId: 'comp-1',
      doctorId: 'doc-1',
      patientId: 'pat-2',
      materialId: 'zirconia',
      teeth: ['11', '21'],
      shade: 'BL2 (Bleach)',
      priority: 'vip',
      status: 'in_progress',
      orderDate: '2026-09-06',
      trialDate: '2026-09-08',
      deliveryDate: '2026-09-09',
      price: 8000,
      notes: 'Ön kesiciler, çok estetik geçiş ve mamelon efekti isteniyor.',
      currentStepIndex: 2, // CAM Frezeleme
      steps: [
        {
          order: 1,
          name: 'Dijital Ölçü / 3D Model Tarama',
          status: 'completed',
          technician: 'Murat Teknisyen',
          completedAt: '2026-09-06 10:00',
          notes: '3Shape ile tarandı.'
        },
        {
          order: 2,
          name: 'CAD Tasarımı (3D Dijital Dizayn)',
          status: 'completed',
          technician: 'Murat Teknisyen',
          completedAt: '2026-09-06 15:30',
          notes: 'Anatomik form hekime ön onay için iletildi, onaylandı.'
        },
        {
          order: 3,
          name: 'CAM Frezeleme (Milling Kazıma)',
          status: 'in_progress',
          technician: 'Murat Teknisyen',
          startedAt: '2026-09-07 10:00',
          notes: 'Multilayer 98mm blok frezede işleniyor.'
        },
        {
          order: 4,
          name: 'Bloktan Ayırma & Likit Renklendirme',
          status: 'pending',
          technician: 'Murat Teknisyen'
        },
        {
          order: 5,
          name: 'Yüksek Isı Sinterleme (1500°C)',
          status: 'pending',
          technician: 'Ali Usta'
        },
        {
          order: 6,
          name: 'Morfoloji & Oklüzal Tesviye',
          status: 'pending',
          technician: 'Yusuf Usta'
        },
        {
          order: 7,
          name: 'Karakterizasyon & Glaze Fırını',
          status: 'pending',
          technician: 'Elif Teknisyen'
        },
        {
          order: 8,
          name: 'Kalite Kontrol & Paketleme',
          status: 'pending',
          technician: 'Yusuf Usta'
        }
      ]
    },

    {
      id: 'ORD-2026-003',
      companyId: 'comp-2',
      doctorId: 'doc-3',
      patientId: 'pat-3',
      materialId: 'implant',
      teeth: ['46'],
      shade: 'A3',
      priority: 'normal',
      status: 'in_progress',
      orderDate: '2026-09-04',
      trialDate: '2026-09-07',
      deliveryDate: '2026-09-08',
      price: 5500,
      notes: 'Straumann uyumlu Ti-Base vidalı sistem.',
      currentStepIndex: 6, // Glaze, Polisaj
      steps: [
        {
          order: 1,
          name: 'Analog Model & Tarama Gövdesi (Scan Body)',
          status: 'completed',
          technician: 'Ayşe Teknisyen',
          completedAt: '2026-09-04 12:00'
        },
        {
          order: 2,
          name: 'Özel Dayanak (Custom Ti-Base) CAD Tasarımı',
          status: 'completed',
          technician: 'Murat Teknisyen',
          completedAt: '2026-09-04 16:00'
        },
        {
          order: 3,
          name: 'Titanyum Bar / Altyapı Kazıma',
          status: 'completed',
          technician: 'Ali Usta',
          completedAt: '2026-09-05 11:00'
        },
        {
          order: 4,
          name: 'Pasif Uyum & Sheffield / Jig Testi',
          status: 'completed',
          technician: 'Ali Usta',
          completedAt: '2026-09-05 14:00'
        },
        {
          order: 5,
          name: 'Estetik Üstyapı Katmanlama / Zirkon Hibritleme',
          status: 'completed',
          technician: 'Yusuf Usta',
          completedAt: '2026-09-06 13:00'
        },
        {
          order: 6,
          name: 'Vida Kanalı Düzenleme & Oklüzal Uyum',
          status: 'completed',
          technician: 'Yusuf Usta',
          completedAt: '2026-09-06 17:00'
        },
        {
          order: 7,
          name: 'Glaze, Polisaj & Aksesuar Paketi',
          status: 'in_progress',
          technician: 'Elif Teknisyen',
          startedAt: '2026-09-07 11:30'
        },
        {
          order: 8,
          name: 'Son Kalite & Teslimat',
          status: 'pending',
          technician: 'Yusuf Usta'
        }
      ]
    }
  ]
};

// Veri Yönetim Sınıfı (Data Store)
class DentalStore {
  constructor() {
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
    }
    // İlk açılışta demo verilerini kaydet
    this.saveToStorage(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveToStorage(dataToSave = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('LocalStorage yazma hatası:', e);
    }
  }

  resetToDemo() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveToStorage();
    return this.data;
  }

  exportDataJson() {
    return JSON.stringify(this.data, null, 2);
  }

  importDataJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.companies && parsed.doctors && parsed.patients && parsed.orders) {
        this.data = parsed;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error('JSON Import hatası:', e);
      return false;
    }
  }

  // --- Firmalar ---
  getCompanies() {
    return this.data.companies || [];
  }

  getCompany(id) {
    return this.getCompanies().find(c => c.id === id);
  }

  saveCompany(company) {
    if (!company.id) {
      company.id = 'comp-' + Date.now();
      company.createdAt = new Date().toISOString().split('T')[0];
      this.data.companies.unshift(company);
    } else {
      const idx = this.data.companies.findIndex(c => c.id === company.id);
      if (idx !== -1) {
        this.data.companies[idx] = { ...this.data.companies[idx], ...company };
      }
    }
    this.saveToStorage();
    return company;
  }

  deleteCompany(id) {
    this.data.companies = this.data.companies.filter(c => c.id !== id);
    // İlişkili doktorlar ve siparişleri koruyabilir veya işaretsiz bırakabiliriz
    this.saveToStorage();
  }

  // --- Doktorlar ---
  getDoctors(companyId = null) {
    let docs = this.data.doctors || [];
    if (companyId) {
      docs = docs.filter(d => d.companyId === companyId);
    }
    return docs;
  }

  getDoctor(id) {
    return (this.data.doctors || []).find(d => d.id === id);
  }

  saveDoctor(doc) {
    if (!doc.id) {
      doc.id = 'doc-' + Date.now();
      this.data.doctors.unshift(doc);
    } else {
      const idx = this.data.doctors.findIndex(d => d.id === doc.id);
      if (idx !== -1) {
        this.data.doctors[idx] = { ...this.data.doctors[idx], ...doc };
      }
    }
    this.saveToStorage();
    return doc;
  }

  deleteDoctor(id) {
    this.data.doctors = this.data.doctors.filter(d => d.id !== id);
    this.saveToStorage();
  }

  // --- Hastalar ---
  getPatients(doctorId = null) {
    let pats = this.data.patients || [];
    if (doctorId) {
      pats = pats.filter(p => p.doctorId === doctorId);
    }
    return pats;
  }

  getPatient(id) {
    return (this.data.patients || []).find(p => p.id === id);
  }

  savePatient(pat) {
    if (!pat.id) {
      pat.id = 'pat-' + Date.now();
      this.data.patients.unshift(pat);
    } else {
      const idx = this.data.patients.findIndex(p => p.id === pat.id);
      if (idx !== -1) {
        this.data.patients[idx] = { ...this.data.patients[idx], ...pat };
      }
    }
    this.saveToStorage();
    return pat;
  }

  deletePatient(id) {
    this.data.patients = this.data.patients.filter(p => p.id !== id);
    this.saveToStorage();
  }

  // --- İş Emirleri (Orders) ---
  getOrders() {
    return this.data.orders || [];
  }

  getOrder(id) {
    return this.getOrders().find(o => o.id === id);
  }

  saveOrder(order) {
    if (!order.id) {
      const count = (this.data.orders.length + 1).toString().padStart(3, '0');
      order.id = `ORD-${new Date().getFullYear()}-${count}`;
      order.orderDate = order.orderDate || new Date().toISOString().split('T')[0];
      this.data.orders.unshift(order);
    } else {
      const idx = this.data.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        this.data.orders[idx] = { ...this.data.orders[idx], ...order };
      }
    }
    this.saveToStorage();
    return order;
  }

  deleteOrder(id) {
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    this.saveToStorage();
  }

  // Aşama Durumu Güncelleme
  updateStepStatus(orderId, stepIndex, newStatus, technician = '', notes = '') {
    const order = this.getOrder(orderId);
    if (!order || !order.steps || !order.steps[stepIndex]) return null;

    const step = order.steps[stepIndex];
    step.status = newStatus;
    if (technician) step.technician = technician;
    if (notes) step.notes = notes;

    const nowStr = new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

    if (newStatus === 'in_progress') {
      step.startedAt = nowStr;
      order.status = 'in_progress';
      order.currentStepIndex = stepIndex;
    } else if (newStatus === 'completed') {
      step.completedAt = nowStr;
      // Bir sonraki aşamaya otomatik geçiş kontrolü
      if (stepIndex + 1 < order.steps.length) {
        order.currentStepIndex = stepIndex + 1;
        if (order.steps[stepIndex + 1].status === 'pending') {
          order.steps[stepIndex + 1].status = 'in_progress';
          order.steps[stepIndex + 1].startedAt = nowStr;
        }
      } else {
        // Tüm adımlar tamamlandı!
        order.status = 'completed';
      }
    } else if (newStatus === 'revision') {
      step.revisionAt = nowStr;
      order.status = 'revision';
    }

    this.saveToStorage();
    return order;
  }
}

// Global Store Örneği
window.DentalDB = new DentalStore();
window.DEFAULT_MATERIAL_PIPELINES = DEFAULT_MATERIAL_PIPELINES;
window.VITA_SHADES = VITA_SHADES;
window.TECHNICIANS = TECHNICIANS;
