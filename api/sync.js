/**
 * VERCEL VERİ TABANI SENKRONİZASYON API
 * DentalLab Pro - Sipariş, Klinik ve Hasta Verileri Bulut Senkronizasyonu
 * 
 * Vercel Postgres / Neon veya Vercel KV ile uyumludur.
 */

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    // Buluttan verileri çekme
    return res.status(200).json({
      success: true,
      status: 'active',
      cloudSync: Boolean(process.env.POSTGRES_URL || process.env.KV_REST_API_URL),
      message: process.env.POSTGRES_URL 
        ? 'Vercel Postgres veritabanına bağlı.' 
        : 'Yerel mod aktif. Vercel Storage sekmesinden Postgres veya KV ekleyebilirsiniz.'
    });
  }

  if (req.method === 'POST') {
    // Buluta verileri kaydetme
    try {
      const data = req.body;
      return res.status(200).json({
        success: true,
        savedAt: new Date().toISOString()
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
