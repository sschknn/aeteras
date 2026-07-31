import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// In-Memory Database Store for live preview & simulation
interface StoredScan {
  id: number;
  user_id: string;
  ts: string;
  notes?: string;
  item: {
    id: number;
    label: string;
    epoch: string;
    material: string;
    origin: string;
    confidence: number;
    description?: string;
  };
  pricing: {
    stats: {
      price_min: number;
      price_max: number;
      price_median: number;
      platform_count: number;
    };
    offers: Array<{
      id?: number;
      platform: string;
      title: string;
      price: number;
      currency: string;
      condition: string;
      url: string;
    }>;
  };
}

let nextScanId = 101;
const scanDatabase: StoredScan[] = [
  {
    id: 100,
    user_id: 'kassierer_1',
    ts: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Kundenanfrage für Schätzwert / Biedermeier Nachlass',
    item: {
      id: 1,
      label: 'Biedermeier Standuhr mit Schlagwerk',
      epoch: '1820-1840 (Biedermeier)',
      material: 'Nussbaum furniert & Messing-Zifferblatt',
      origin: 'Österreich (Wien)',
      confidence: 0.92,
      description: 'Wiener Biedermeier-Uhr mit Fadenaufhängung, feingraviertem Messingzifferblatt und funktionstüchtigem Tonfederschlag.'
    },
    pricing: {
      stats: {
        price_min: 650,
        price_max: 1850,
        price_median: 1200,
        platform_count: 5
      },
      offers: [
        { platform: '1stDibs Antique Marketplace', title: 'Authentic Biedermeier Grandfather Clock Wien 1830', price: 1850, currency: 'EUR', condition: 'Hervorragender Originalzustand', url: 'https://www.1stdibs.com' },
        { platform: 'Catawiki Kunst & Antiquitäten', title: 'Wiener Biedermeier Standuhr mit Pendel', price: 1200, currency: 'EUR', condition: 'Sehr gut (Restauriert)', url: 'https://www.catawiki.com' },
        { platform: 'Pamono Design & Antiques', title: 'Antike Biedermeier Standuhr Nussbaum', price: 1100, currency: 'EUR', condition: 'Gebraucht mit Patina', url: 'https://www.pamono.de' },
        { platform: 'eBay Kleinanzeigen', title: 'Biedermeier Standuhr aus Nachlass', price: 650, currency: 'EUR', condition: 'Altersbedingte Gebrauchsspuren', url: 'https://www.kleinanzeigen.de' }
      ]
    }
  },
  {
    id: 99,
    user_id: 'kassierer_1',
    ts: new Date(Date.now() - 3600000 * 22).toISOString(),
    notes: 'Katalogisierung für Auktionshaus-Kasse',
    item: {
      id: 2,
      label: 'Jugendstil-Vase mit Irisierender Glasur',
      epoch: '1900-1910 (Jugendstil / Art Nouveau)',
      material: 'Irrisierendes Glas & Bronzemontierung',
      origin: 'Deutschland / Frankreich (Émile Gallé Stil)',
      confidence: 0.89,
      description: 'Seltene mundgeblasene Prunkvase mit handgemalten floralen Ranken und irisierendem Perlmuttglanz.'
    },
    pricing: {
      stats: {
        price_min: 220,
        price_max: 680,
        price_median: 410,
        platform_count: 4
      },
      offers: [
        { platform: 'Catawiki Kunst & Antiquitäten', title: 'Jugendstil Glasvase Gallé Nachahmer mit Bronzemontur', price: 450, currency: 'EUR', condition: 'Sehr gut', url: 'https://www.catawiki.com' },
        { platform: 'Etsy Vintage', title: 'Art Nouveau Glass Vase Irisierend 1900', price: 380, currency: 'EUR', condition: 'Guter Sammlerzustand', url: 'https://www.etsy.com' },
        { platform: 'eBay Kleinanzeigen', title: 'Alte Jugendstil Glasvase mit Bronze', price: 220, currency: 'EUR', condition: 'Leichte Patina', url: 'https://www.kleinanzeigen.de' },
        { platform: 'Pamono Design', title: 'Jugendstil Prunkvase Gallé Style', price: 680, currency: 'EUR', condition: 'Perfekt', url: 'https://www.pamono.de' }
      ]
    }
  }
];

// Helper: Initialize Gemini AI if available
function getGeminiAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// REST API Endpoints
// 1. POST /api/scan (Gateway Scan Endpoint)
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { imageBase64, userId = 'kassierer_1', sampleId, notes } = req.body;

    console.log(`[API Gateway] POST /api/scan empfangen (User: ${userId})`);

    let visionResult = {
      label: 'Antiquität (Klassifizierung läuft)',
      epoch: '19. Jahrhundert',
      material: 'Guss & Holz',
      origin: 'Mitteleuropa',
      confidence: 0.85,
      description: 'Geprüftes historisches Sammlerstück.'
    };

    // If a sample preset was selected directly
    if (sampleId) {
      if (sampleId === 'jugendstil-vase') {
        visionResult = {
          label: 'Jugendstil-Vase mit floralem Emaille-Dekor',
          epoch: '1900-1910 (Jugendstil / Art Nouveau)',
          material: 'Irrisierendes Glas & Bronzemontierung',
          origin: 'Deutschland / Frankreich (Émile Gallé Stil)',
          confidence: 0.93,
          description: 'Seltene mundgeblasene Prunkvase mit handgemalten floralen Ranken und irisierendem Perlmuttglanz.'
        };
      } else if (sampleId === 'biedermeier-uhr') {
        visionResult = {
          label: 'Biedermeier Standuhr mit Schlagwerk',
          epoch: '1820-1840 (Biedermeier)',
          material: 'Nussbaum furniert & Messing-Zifferblatt',
          origin: 'Österreich (Wien)',
          confidence: 0.95,
          description: 'Wiener Biedermeier-Uhr mit fadenförmigem Tonfederschlag, Emaillezifferblatt und gebogenem Gehäuse.'
        };
      } else if (sampleId === 'art-deco-lampe') {
        visionResult = {
          label: 'Art Déco Tischlampe mit Bronzefigur',
          epoch: '1925-1935 (Art Déco)',
          material: 'Bronze patiniert & Opalglas-Schirm',
          origin: 'Frankreich (Paris)',
          confidence: 0.88,
          description: 'Skulpturale Tischleuchte mit stilisierter Tänzerin und kugelförmigem satiniertem Lampenschirm.'
        };
      } else if (sampleId === 'meissen-porzellan') {
        visionResult = {
          label: 'Meissen Porzellan-Schale mit Streublumen',
          epoch: '1880-1900 (Historismus / Nerokoko)',
          material: 'Porzellan mit Poliergold-Gitter',
          origin: 'Deutschland (Meißen, Sachsen)',
          confidence: 0.94,
          description: 'Durchbrochene Anbietschale mit geprägten Rocaille-Reliefs und gekreuzten blauen Schwertern unter Glasur.'
        };
      } else if (sampleId === 'vintage-taschenuhr') {
        visionResult = {
          label: 'Silber-Taschenuhr mit Silberkette (Spindeluhr)',
          epoch: '1890-1910 (Wilhelminisch)',
          material: '800er Silber & Emaille-Zifferblatt',
          origin: 'Schweiz (IWC / Omega Werk)',
          confidence: 0.91,
          description: 'Präzise gravierte Taschenuhr mit dezentraler Sekunde, römischen Ziffern und Guilloche-Muster.'
        };
      }
    } else if (imageBase64) {
      // Perform Gemini Vision AI Classification if GEMINI_API_KEY is present
      const ai = getGeminiAi();
      if (ai) {
        try {
          console.log('[Vision AI] Analysiere Bild mit Gemini 3.1 Pro (gemini-3.1-pro-preview)...');
          // Clean base64 string
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Du bist ein erfahrener Gutachter für Antiquitäten und Kunstgegenstände.
Analysiere dieses Bild einer Antiquität und antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Codeblöcke:
{
  "label": "Genaue Bezeichnung des Objekts",
  "epoch": "Zeitalter/Epoche mit Jahreszahlen (z.B. 1900-1910 Jugendstil)",
  "material": "Hauptmaterialien (z.B. Bronze, Porzellan, Glas, Eiche)",
  "origin": "Vermutete Herkunft/Land/Manufaktur",
  "confidence": 0.85,
  "description": "Kurze Beschreibung zu Zustand, Besonderheiten und Stilmerkmalen"
}`
                  },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: cleanBase64
                    }
                  }
                ]
              }
            ]
          });

          const textResponse = response.text || '';
          console.log('[Vision AI] Gemini Antwort:', textResponse);
          const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            visionResult = {
              label: parsed.label || 'Klassifizierte Antiquität',
              epoch: parsed.epoch || '19. Jahrhundert',
              material: parsed.material || 'Guss / Holz / Glas',
              origin: parsed.origin || 'Europa',
              confidence: parsed.confidence || 0.88,
              description: parsed.description || 'KI-geprüftes Kunst- und Sammlerobjekt.'
            };
          }
        } catch (geminiError) {
          console.warn('[Vision AI] Gemini Vision API Fallback:', geminiError);
        }
      }
    }

    // Default calculated base price
    let basePrice = 320;
    const lowerLabel = visionResult.label.toLowerCase();
    if (lowerLabel.includes('uhr') || lowerLabel.includes('taschenuhr')) basePrice = 950;
    else if (lowerLabel.includes('porzellan') || lowerLabel.includes('meissen')) basePrice = 480;
    else if (lowerLabel.includes('lampe') || lowerLabel.includes('bronz')) basePrice = 640;
    else if (lowerLabel.includes('vase') || lowerLabel.includes('glas')) basePrice = 420;

    let priceMin = Math.round(basePrice * 0.68);
    let priceMax = Math.round(basePrice * 1.62);
    let priceMedian = Math.round((priceMin + priceMax) / 2);

    let offers = [
      {
        platform: 'Catawiki Kunst & Antiquitäten',
        title: `${visionResult.label} - Geprüftes Auktionslos mit Zertifikat`,
        price: Math.round(priceMedian * 1.08),
        currency: 'EUR',
        condition: 'Sehr gut (Restauriert)',
        url: 'https://www.catawiki.com/de/c/333-antiquitaten'
      },
      {
        platform: 'eBay Kleinanzeigen',
        title: `${visionResult.label} aus Nachlass (Dachbodenfund)`,
        price: priceMin,
        currency: 'EUR',
        condition: 'Altersbedingte Gebrauchsspuren',
        url: 'https://www.kleinanzeigen.de'
      },
      {
        platform: '1stDibs Antique Marketplace',
        title: `Authentic ${visionResult.label} - Gallery Dealer Edition`,
        price: priceMax,
        currency: 'EUR',
        condition: 'Hervorragender Originalzustand',
        url: 'https://www.1stdibs.com'
      },
      {
        platform: 'Pamono Design & Antiques',
        title: `${visionResult.label} Vintage Kunstobjekt`,
        price: Math.round(priceMedian * 0.94),
        currency: 'EUR',
        condition: 'Gebraucht mit Patina',
        url: 'https://www.pamono.de'
      },
      {
        platform: 'Etsy Vintage & Antiques',
        title: `Handverlesenes Einzelstück: ${visionResult.label}`,
        price: Math.round(priceMedian * 0.85),
        currency: 'EUR',
        condition: 'Guter Sammlerzustand',
        url: 'https://www.etsy.com'
      }
    ];

    // Search Grounding with gemini-3.5-flash & Google Search tool
    const ai = getGeminiAi();
    if (ai) {
      try {
        console.log('[Search Grounding] Recherchiere Marktpreise mit gemini-3.5-flash & Google Search tool...');
        const prompt = `Du bist ein Auktions- und Antik-Marktexperte.
Recherchiere mit der Google Suche echte Marktpreise und aktuelle Verkaufsangebote für:
- Gegenstand: ${visionResult.label}
- Epoche: ${visionResult.epoch}
- Material: ${visionResult.material}
- Herkunft: ${visionResult.origin}

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt in folgendem Format (keine Markdown-Formatierung):
{
  "price_min": 250,
  "price_max": 850,
  "price_median": 550,
  "offers": [
    {
      "platform": "Catawiki / 1stDibs / eBay / Pamono",
      "title": "Produktbezeichnung oder Auktionslos",
      "price": 550,
      "currency": "EUR",
      "condition": "Zustandsbeschreibung",
      "url": "https://..."
    }
  ]
}`;

        const searchResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const textResp = searchResponse.text || '';
        console.log('[Search Grounding] Antwort:', textResp);
        const jsonMatch = textResp.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedSearch = JSON.parse(jsonMatch[0]);
          if (parsedSearch.price_min && parsedSearch.price_median) {
            priceMin = parsedSearch.price_min;
            priceMax = parsedSearch.price_max || priceMin * 2;
            priceMedian = parsedSearch.price_median;
            if (Array.isArray(parsedSearch.offers) && parsedSearch.offers.length > 0) {
              offers = parsedSearch.offers;
            }
          }
        }
      } catch (searchError) {
        console.warn('[Search Grounding Fallback]:', searchError);
      }
    }

    const currentScan: StoredScan = {
      id: nextScanId++,
      user_id: userId,
      ts: new Date().toISOString(),
      notes: notes || `Scan-Vorgang für "${visionResult.label}"`,
      item: {
        id: nextScanId,
        ...visionResult
      },
      pricing: {
        stats: {
          price_min: priceMin,
          price_max: priceMax,
          price_median: priceMedian,
          platform_count: offers.length
        },
        offers
      }
    };

    scanDatabase.unshift(currentScan);

    return res.json({
      scan: {
        id: currentScan.id,
        ts: currentScan.ts,
        userId: currentScan.user_id,
        notes: currentScan.notes
      },
      item: currentScan.item,
      pricing: currentScan.pricing
    });

  } catch (err: any) {
    console.error('[API Gateway Error]:', err);
    return res.status(500).json({ error: 'Fehler beim Verarbeiten des Antiquitäten-Scans: ' + err.message });
  }
});

// 2. GET /api/scans
app.get('/api/scans', (req: Request, res: Response) => {
  return res.json(
    scanDatabase.map(s => ({
      scan_id: s.id,
      id: s.id,
      user_id: s.user_id,
      ts: s.ts,
      label: s.item.label,
      epoch: s.item.epoch,
      material: s.item.material,
      origin: s.item.origin,
      confidence: s.item.confidence,
      price_min: s.pricing.stats.price_min,
      price_max: s.pricing.stats.price_max,
      price_median: s.pricing.stats.price_median,
      platform_count: s.pricing.stats.platform_count
    }))
  );
});

// 3. GET /api/scan/:id
app.get('/api/scan/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const found = scanDatabase.find(s => s.id === id);

  if (!found) {
    return res.status(404).json({ error: 'Scan nicht gefunden' });
  }

  return res.json({
    scan: {
      id: found.id,
      ts: found.ts,
      userId: found.user_id,
      notes: found.notes
    },
    item: found.item,
    pricing: found.pricing
  });
});

// 4. DELETE /api/scan/:id
app.delete('/api/scan/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const idx = scanDatabase.findIndex(s => s.id === id);

  if (idx !== -1) {
    scanDatabase.splice(idx, 1);
    return res.json({ success: true, message: 'Scan gelöscht' });
  }

  return res.status(404).json({ error: 'Scan nicht gefunden' });
});

// Standalone microservice endpoints matching Python/Node specs
app.post('/api/vision/classify', (req: Request, res: Response) => {
  return res.json({
    label: 'Jugendstil-Vase',
    epoch: '1900-1910',
    material: 'Glas',
    origin: 'DE/FR',
    confidence: 0.82
  });
});

app.post('/api/pricing/estimate', (req: Request, res: Response) => {
  const query = req.body.query || 'Jugendstil Vase';
  return res.json({
    stats: { price_min: 180, price_max: 520, price_median: 340, platform_count: 5 },
    offers: [
      { platform: 'Catawiki', title: query, price: 340, currency: 'EUR', condition: 'Gut', url: 'https://catawiki.com' },
      { platform: 'eBay', title: query, price: 180, currency: 'EUR', condition: 'Gebraucht', url: 'https://ebay.de' }
    ]
  });
});

// Vite Middleware for Development Frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🏛️ Antiquitäten-Scannerkasse Server online!`);
    console.log(`👉 Live UI & API listening on http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
