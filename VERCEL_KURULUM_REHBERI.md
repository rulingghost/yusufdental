# DentalLab Pro - Vercel ve Çoklu Cihaz Bulut Kurulum Rehberi

Bu rehber, **DentalLab Pro** uygulamasını Vercel'de yayına almak, **başka cihazlardan (telefon, tablet, ev ve ofis bilgisayarı)** aynı verilere erişmek ve **Vercel Blob** konusunu netleştirmek için hazırlanmıştır.

---

## ❓ Soru: "Vercel üzerinden Blob almam gerekiyor mu? Verileri nasıl kaydeder?"

### 📌 Kısa ve Net Cevap:
- **HAYIR, zorunlu değildir!** 
- **Vercel Blob Nedir?** Vercel Blob, büyük **dosyalar** (hastanın ağız içi fotoğrafları, röntgenleri ve 3D STL / CAD dijital diş taramaları) içindir.
- **Sipariş, Firma, Hekim ve Hasta Verileri Nerede Saklanır?**
  Uygulamanız için özel olarak geliştirdiğimiz **`/api/db` Bulut API** sistemi sayesinde verileriniz sunucuda saklanır ve **tüm cihazlarınızla (telefon, tablet, bilgisayar) otomatik olarak eşitlenir**.
  - İsterseniz Vercel Storage sekmesinden tek tıkla **Vercel KV (Redis)** veya **Vercel Postgres** ekleyebilir,
  - Ya da uygulama içindeki **☁️ Bulut Senkronizasyonu** menüsünden ortak Laboratuvar Kodunuzu (`yusuf-dis-lab`) girerek tüm cihazlarınızı saniyeler içinde birbirine bağlayabilirsiniz.

---

## 📱 Başka Cihazlardan (Telefon / Diğer Bilgisayar) Giriş Yapma

Uygulamanız artık **tarayıcı hafızasına hapsolmaz**:

1. Sitenizi Vercel'e yükleyin (Örn: `https://dentallab-yusuf.vercel.app`).
2. Bu linki **cep telefonunuzdan**, **evdeki bilgisayarınızdan** veya **teknisyenlerinizin ekranından** açın.
3. Sağ üstteki **"☁️ Bulut Senkronu"** butonuna basın.
4. Aynı Laboratuvar Kodunun (Örn: `yusuf-dis-lab`) yazılı olduğunu teyit edin.
5. **Artık ofis bilgisayarınızdan eklediğiniz bir iş emri veya klinik, cep telefonunuzda anında görünür!**
6. Üstelik sekmeye her döndüğünüzde veya 25 saniyede bir sistem diğer cihazlardaki değişiklikleri otomatik olarak arka planda kontrol eder.

---

## 🚀 Projeyi Vercel'e Yükleme (2 Dakika)

### Yöntem A: GitHub ile (Tavsiye Edilen)
1. Bu klasörü bir GitHub reposuna yükleyin:
   ```bash
   git init
   git add .
   git commit -m "DentalLab Pro Temiz Surum"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/yusuf-firma.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) adresine gidin.
3. **"Add New..."** ➔ **"Project"** seçin.
4. Reponuzu seçip **"Deploy"** butonuna basın.
5. 30 saniye içinde siteniz canlıya alınır!

### Yöntem B: Vercel Komut Satırı (CLI)
Terminalde bu klasörde şu komutu çalıştırın:
```bash
npx vercel
```
Tüm sorulara `Enter` basarak onay verin, anında siteniz yayına girer.

---

## 📋 Kanban Üretim Panosu Özellikleri
- **8 Klinik Üretim İstasyonu:** Model & Alçı, Mum & CAD, Altyapı & CAM Freze, Katmanlama, Fırınlama, Morfoloji, Glaze & Polisaj, Kalite & Sevkiyat.
- **Tek Tıkla İlerletme:** Kartın üzerindeki `Sonraki Aşama ➔` butonuna basarak işi bir sonraki istasyona taşıyabilirsiniz.
- **Sürükle - Bırak (Drag & Drop):** Bir iş kartını tutup istediğiniz istasyon sütununa bırakabilirsiniz.
- **Gelişmiş Filtreler:** Klinik, Teknisyen, Öncelik (Acil/Normal) ve Diş numarasına göre anlık filtreleme.
- **Tamamlananlar Arşivi:** Biten işler arşive gider; dilediğiniz an `İşlemi Yeniden Başlat` butonuyla üretime geri alıp revize edebilirsiniz.
