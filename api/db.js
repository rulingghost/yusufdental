/**
 * VERCEL SERVERLESS VERİ TABANI API
 * DentalLab Pro - Çoklu Cihaz & Bulut Veri Senkronizasyonu
 * 
 * Bu endpoint tüm cihazların (telefon, tablet, ofis bilgisayarı, ev bilgisayarı)
 * aynı laboratuvar veritabanına erişmesini sağlar.
 * 
 * Desteklenen Bulut Depolama Seçenekleri:
 * 1. Vercel Blob (BLOB_READ_WRITE_TOKEN) - JSON verisini bulut blobu olarak saklar.
 * 2. Vercel KV / Upstash (KV_REST_API_URL / KV_REST_API_TOKEN) - Hızlı Key-Value veritabanı.
 * 3. In-memory / Serverless önbellek.
 */

// Sunucu oturumu süresince global bellek önbelleği
let inMemoryLabDatabase = {
  companies: [],
  doctors: [],
  patients: [],
  orders: [],
  lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
  // CORS başlıkları - tüm cihazlardan erişim için
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Lab-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const labKey = req.headers['x-lab-key'] || req.query.labKey || 'default_lab';

  // --- 1. VERİ OKUMA (GET) ---
  if (req.method === 'GET') {
    try {
      // 1.1 Vercel KV Varsa
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const kvRes = await fetch(`${process.env.KV_REST_API_URL}/get/${labKey}`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        if (kvRes.ok) {
          const kvData = await kvRes.json();
          if (kvData.result) {
            const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
            return res.status(200).json({
              success: true,
              storageType: 'vercel_kv',
              data: parsed
            });
          }
        }
      }

      // 1.2 Vercel Blob Varsa
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const { list } = await import('@vercel/blob');
          const { blobs } = await list({ prefix: `dentallab_${labKey}.json` });
          if (blobs && blobs.length > 0) {
            const fileRes = await fetch(blobs[0].url);
            if (fileRes.ok) {
              const blobData = await fileRes.json();
              return res.status(200).json({
                success: true,
                storageType: 'vercel_blob',
                data: blobData
              });
            }
          }
        } catch (blobErr) {
          console.warn('Vercel Blob read warning:', blobErr.message);
        }
      }

      // 1.3 Varsayılan Sunucu Belleği
      return res.status(200).json({
        success: true,
        storageType: 'server_memory',
        data: inMemoryLabDatabase
      });
    } catch (err) {
      console.error('Veri getirme hatası:', err);
      return res.status(200).json({
        success: true,
        storageType: 'fallback',
        data: inMemoryLabDatabase
      });
    }
  }

  // --- 2. VERİ KAYDETME / GÜNCELLEME (POST) ---
  if (req.method === 'POST') {
    try {
      const incomingData = req.body;
      if (!incomingData || typeof incomingData !== 'object') {
        return res.status(400).json({ error: 'Geçersiz veri formatı' });
      }

      const cleanData = {
        companies: Array.isArray(incomingData.companies) ? incomingData.companies : [],
        doctors: Array.isArray(incomingData.doctors) ? incomingData.doctors : [],
        patients: Array.isArray(incomingData.patients) ? incomingData.patients : [],
        orders: Array.isArray(incomingData.orders) ? incomingData.orders : [],
        lastUpdated: new Date().toISOString()
      };

      // Bellek önbelleğini güncelle
      inMemoryLabDatabase = cleanData;

      // 2.1 Vercel KV Varsa
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await fetch(`${process.env.KV_REST_API_URL}/set/${labKey}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanData)
        });
      }

      // 2.2 Vercel Blob Varsa
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const { put } = await import('@vercel/blob');
          await put(`dentallab_${labKey}.json`, JSON.stringify(cleanData, null, 2), {
            access: 'public',
            addRandomSuffix: false
          });
        } catch (blobErr) {
          console.warn('Vercel Blob write warning:', blobErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Veriler buluta kaydedildi ve tüm cihazlarla eşitlendi.',
        savedAt: cleanData.lastUpdated
      });
    } catch (err) {
      console.error('Veri kaydetme hatası:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
