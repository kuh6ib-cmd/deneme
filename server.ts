import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// AI Fleet Executive Advisor Route
app.post('/api/gemini/executive-insights', async (req, res) => {
  try {
    const { metrics, anomalies, topRisks, brandStats, supplierStats } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: 'rule-based',
        insights: generateRuleBasedInsights(metrics, anomalies, topRisks, brandStats, supplierStats),
      });
    }

    const prompt = `
Sen kıdemli bir kurumsal filo yönetim direktörü ve operasyonel verimlilik uzmanısın.
Aşağıdaki filo bakım-onarım, operasyon ve maliyet analizi verilerini inceleyerek üst yönetime (C-Level / Filo Direktörü) sunulacak stratejik bir "Yönetici Karar Destek Raporu" oluştur.

FİLO VERİLERİ VE METRİKLERİ:
- Toplam Harcama: ${metrics?.totalCost?.toLocaleString('tr-TR')} ₺
- Toplam Araç Sayısı: ${metrics?.totalVehicles}
- Araç Başına Ortalama Maliyet: ${metrics?.avgCostPerVehicle?.toLocaleString('tr-TR')} ₺
- Toplam Bakım/Onarım İşlemi: ${metrics?.totalRecords}
- Veri Kalite Skoru: %${metrics?.dataQualityScore}
- Tespit Edilen Kritik Anomali/Uç Değer Sayısı: ${anomalies?.length || 0}
- Kritik Riskli Araç Sayısı (>8 Yaş & >150k KM): ${topRisks?.filter((r: any) => r.riskLevel === 'Kritik Risk').length || 0}
- Maliyet Riski Taşıyan Araç Sayısı: ${topRisks?.filter((r: any) => r.riskLevel === 'Maliyet Riski').length || 0}

ÖNDE GELEN MARKA VE TEDARİKÇİ VERİLERİ:
- Markalar: ${JSON.stringify(brandStats?.slice(0, 5))}
- Önde Gelen Servisler: ${JSON.stringify(supplierStats?.slice(0, 5))}

Lütfen şu başlıklar altında Türkçe, son derece profesyonel, veri odaklı ve somut rakamlara dayalı stratejik analiz üret:
1. 🎯 STRATEJİK YÖNETİCİ ÖZETİ & DÖNÜŞÜM VİZYONU
2. ⚠️ KRİTİK FİNANSAL VE OPERASYONEL RİSKLER (Kara Delik Araçlar ve Tedarikçi Yoğunlaşması)
3. ⏱️ ZAMAN KADEMELİ AKSİYON YOL HARİTASI:
   - 0-3 Ay (Hızlı Kazanımlar, Outlier Denetimi, Fatura İtirazları)
   - 3-12 Ay (Tedarikçi Sözleşme Revizyonları, Bakım Standartları)
   - 12+ Ay (Filo Yenileme, Elektrikli/Hibrit Dönüşüm, TCO Optimizasyonu)
4. 💡 TASARRUF POTANSİYELİ VE TAHMİNİ KAZANÇLAR (%15-%25 maliyet optimizasyonu hedefleriyle)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Sen Türkiye ve global otomotiv pazarında uzmanlaşmış, TCO (Toplam Sahip Olma Maliyeti), filo bakım verimliliği ve tedarik zinciri optimizasyonunda uzman bir baş analistsin.',
      },
    });

    const text = response.text || '';
    return res.json({
      success: true,
      source: 'gemini',
      insights: text,
    });
  } catch (error: any) {
    console.error('Gemini error:', error);
    // Fallback gracefully
    const { metrics, anomalies, topRisks, brandStats, supplierStats } = req.body;
    return res.json({
      success: true,
      source: 'rule-based',
      insights: generateRuleBasedInsights(metrics, anomalies, topRisks, brandStats, supplierStats),
    });
  }
});

function generateRuleBasedInsights(metrics: any, anomalies: any[], topRisks: any[], brandStats: any[], supplierStats: any[]) {
  const criticalCount = topRisks?.filter((r: any) => r.riskLevel === 'Kritik Risk').length || 0;
  const costRiskCount = topRisks?.filter((r: any) => r.riskLevel === 'Maliyet Riski').length || 0;
  const topSupplier = supplierStats?.[0]?.name || 'Ana Servis';
  const topBrand = brandStats?.[0]?.name || 'Ana Marka';

  return `### 🎯 Stratejik Yönetici Özeti & Filo Sağlık Raporu
Filo genelinde toplam **${(metrics?.totalCost || 0).toLocaleString('tr-TR')} ₺** harcama gerçekleşmiş olup, araç başına ortalama maliyet **${(metrics?.avgCostPerVehicle || 0).toLocaleString('tr-TR')} ₺** seviyesindedir. Veri kalitesi motorumuz veri setinde **%${metrics?.dataQualityScore || 92}** tutarlılık tespit etmiştir.

---

### ⚠️ Kritik Finansal & Operasyonel Riskler
1. **Yaşlı ve Yüksek Kilometreli Araç Yükü:** Filoda bulunan **${criticalCount} adet araç** hem 8 yaşın hem de 150.000 KM'nin üzerinde olup acil yenileme veya revizyon kararı gerektirmektedir.
2. **Maliyet Sapmaları:** **${costRiskCount} adet araç**, filo ortalama bakım harcamasının %50'den fazla üzerinde seyrederek "Maliyet Kara Deliği" oluşturmaktadır.
3. **Tedarikçi Bağımlılığı:** Harcamaların en büyük payı **${topSupplier}** üzerinde toplanmıştır. Tedarikçi bazında iskonto ve SLA sözleşmeleri revize edilmelidir.

---

### ⏱️ Zaman Kademeli Stratejik Aksiyon Planı

#### 🔴 0 - 3 Ay (Acil Müdahale & Hızlı Kazanımlar)
- **Uç Değer & Fatura Denetimi:** İstatistiksel üst limitlerin üzerindeki ${anomalies?.length || 0} adet sıra dışı faturanın işçilik ve parça birim fiyatları teknik denetimden geçirilmeli, mükerrer veya şişirilmiş kayıtlar için tedarikçilerden iade/mahsup talep edilmelidir.
- **Yüksek Riskli Araçların Karara Bağlanması:** Kritik risk grubundaki ${criticalCount} aracın 2. el piyasa değeri ile kalan bakım yükü karşılaştırılarak derhal ihale/satış takvimine alınmalıdır.
- **KM/Yaş Anomalisine Sahip Araçların Kontrolü:** Odo saati şüpheli veya atıl yatan araçların sahada telemetri ve GPS verileriyle eşleştirilmesi sağlanmalıdır.

#### 🟡 3 - 12 Ay (Süreç İyileştirme & Tedarikçi Yönetimi)
- **Konsolide Parça Tedariği & Master Fiyat Listesi:** En çok kullanılan sarf malzemeler (Debriyaj, Fren balata/disk, Filtre setleri) için merkezi satın alma anlaşması yapılarak servislerin parça kar marjı sınırlandırılmalıdır.
- **Preventif (Önleyici) Bakım Disiplini:** Plansız arıza oranını %30 azaltmak amacıyla periyodik bakım aralıkları telemetri üzerinden otomatik iş emirlerine bağlanmalıdır.
- **Bölgesel Servis Alternatifleri:** En pahalı servis noktalarına alternatif yetkili ve onaylı özel servis ağları kurularak rekabetçi teklif alma kuralı (%12-18 tasarruf) devreye alınmalıdır.

#### 🟢 12+ Ay (Uzun Vadeli Filo Dönüşümü & TCO Optimizasyonu)
- **Düşük TCO'lu Filo Kompozisyonu:** Analiz sonuçlarına göre en düşük KM başı maliyet üreten markalara (${topBrand} vb.) ağırlık verilerek filo standartlaştırılmalıdır.
- **Elektrifikasyon & Hafif Ticari Dönüşümü:** Şehir içi yoğun operasyonda olan araçların elektrikli/hibrit alternatiflerle yenilenmesi yakıt ve bakım giderlerinde %40'a varan kalıcı düşüş sağlayacaktır.
- **Döngüsel Filo Çıkış Stratejisi:** Araçların 4. yıl / 120.000 KM sınırında en yüksek ikinci el değeriyle elden çıkarılmasını sağlayan dinamik sat-yenile politikası benimsenmelidir.

---

### 💡 Tahmini Finansal Tasarruf Etkisi
Önerilen aksiyonların eksiksiz uygulanması halinde yıllık filo bakım-onarım bütçesinde **%18 - %24 aralığında (yaklaşık ${Math.round((metrics?.totalCost || 0) * 0.21).toLocaleString('tr-TR')} ₺)** net tasarruf ve operasyonel duruş sürelerinde **%35 iyileşme** hedeflenmektedir.`;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API GET requests
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Filo Analiz ve Karar Destek Paneli running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
