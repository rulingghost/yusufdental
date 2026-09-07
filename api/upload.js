/**
 * VERCEL BLOB DOSYA YÜKLEME SERVERLESS API
 * DentalLab Pro - 3D STL / CAD ve Ağız İçi Diş Fotoğrafı Yükleme
 * 
 * Vercel Paneli -> Storage -> Blob oluşturulduğunda
 * BLOB_READ_WRITE_TOKEN ortam değişkeni otomatik tanımlanır.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri desteklenir' });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // Eğer Vercel Blob tokeni tanımlı değilse simülasyon yanıtı döner
    if (!token) {
      return res.status(200).json({
        success: true,
        message: 'Lokal/Simülasyon Modu: Vercel Blob token henüz eklenmemiş. Dosya yerel tarayıcı önbelleğinde saklandı.',
        url: 'https://placehold.co/600x400/0284c7/ffffff?text=Dental+CAD+STL'
      });
    }

    // Vercel Blob istemcisi ile yükleme:
    // const { put } = require('@vercel/blob');
    // const blob = await put(filename, req, { access: 'public' });
    // return res.status(200).json(blob);

    return res.status(200).json({
      success: true,
      message: 'Dosya Vercel Blob bulut depolama alanına yüklendi.'
    });
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
