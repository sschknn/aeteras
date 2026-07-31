const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4002;
const PRICE_API_KEY = process.env.PRICE_API_KEY || 'MOCK_KEY_DEMO_123';
const PRICE_API_URL = process.env.PRICE_API_URL || 'https://api.example-price-comparison.com/v1/search';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pricing-service' });
});

/**
 * POST /estimate
 * Request Body: { query: string, attributes?: { label, epoch, material, origin } }
 */
app.post('/estimate', async (req, res) => {
  try {
    const { query, attributes } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Suchanfrage (query) erforderlich' });
    }

    console.log(`[Pricing Service] Suche Angebote für: "${query}" (API: ${PRICE_API_URL})`);

    // HINWEIS FÜR PRODUKTION:
    // Hier wird in Produktion die echte Price-Comparison API aufgerufen, z.B. mit axios/fetch:
    // const response = await fetch(`${PRICE_API_URL}?q=${encodeURIComponent(query)}&api_key=${PRICE_API_KEY}`);
    // const data = await response.json();

    // Dynamische Berechnung realistischer Preisspannen basierend auf Query-Länge / Hashtag
    let basePrice = 250;
    if (query.toLowerCase().includes('uhr') || query.toLowerCase().includes('uhrwerk')) basePrice = 850;
    else if (query.toLowerCase().includes('porzellan') || query.toLowerCase().includes('meissen')) basePrice = 380;
    else if (query.toLowerCase().includes('bronz') || query.toLowerCase().includes('lampe')) basePrice = 620;
    else if (query.toLowerCase().includes('vase') || query.toLowerCase().includes('glas')) basePrice = 410;

    const priceMin = Math.round(basePrice * 0.72);
    const priceMax = Math.round(basePrice * 1.55);
    const priceMedian = Math.round((priceMin + priceMax) / 2);

    const offers = [
      {
        platform: 'Catawiki Kunst & Antiquitäten',
        title: `${query} - Geprüftes Auktionslos mit Zertifikat`,
        price: Math.round(priceMedian * 1.1),
        currency: 'EUR',
        condition: 'Sehr gut (Restauriert)',
        url: 'https://www.catawiki.com/de/c/333-antiquitaten'
      },
      {
        platform: 'eBay Kleinanzeigen',
        title: `${query} aus Nachlass (Dachbodenfund)`,
        price: priceMin,
        currency: 'EUR',
        condition: 'Altersbedingte Gebrauchsspuren',
        url: 'https://www.kleinanzeigen.de'
      },
      {
        platform: '1stDibs Antique Marketplace',
        title: `Authentic ${query} - Gallery Dealer Edition`,
        price: priceMax,
        currency: 'EUR',
        condition: 'Hervorragender Originalzustand',
        url: 'https://www.1stdibs.com'
      },
      {
        platform: 'Pamono Design & Antiques',
        title: `${query} Vintage Kunstobjekt`,
        price: Math.round(priceMedian * 0.95),
        currency: 'EUR',
        condition: 'Gebraucht mit Patina',
        url: 'https://www.pamono.de'
      },
      {
        platform: 'Etsy Vintage & Antiques',
        title: `Handverlesenes Einzelstück: ${query}`,
        price: Math.round(priceMedian * 0.88),
        currency: 'EUR',
        condition: 'Guter Sammlerzustand',
        url: 'https://www.etsy.com'
      }
    ];

    const stats = {
      price_min: priceMin,
      price_max: priceMax,
      price_median: priceMedian,
      platform_count: offers.length
    };

    return res.json({
      stats,
      offers
    });
  } catch (error) {
    console.error('[Pricing Service Error]:', error);
    return res.status(500).json({ error: 'Fehler bei der Preisermittlung' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pricing Service läuft auf Port ${PORT}`);
});
