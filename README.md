# Antiquitäten-Scannerkasse 🏛️ Magna Antiqua Scanner

Eine vollständige, lauffähige Microservice-Architektur und Mobile-App zur visuellen Erkennung, Epochenbestimmung und Live-Marktwertschätzung von Antiquitäten.

---

## 🏗️ Architektur & Projektstruktur

```text
.
├── db/                       # PostgreSQL Datenbank-Schema (DDL)
│   └── schema.sql
├── backend-gateway/          # Express API-Gateway (REST Orchestrator)
│   ├── src/
│   │   ├── index.ts          # REST-Routen (/scan, /scans, /scan/:id)
│   │   └── db.ts             # PostgreSQL Pool-Verbindung
│   ├── Dockerfile
│   └── package.json
├── vision-service/           # FastAPI Python KI/Vision Service
│   ├── app.py                # POST /classify Endpoint
│   ├── requirements.txt
│   └── Dockerfile
├── pricing-service/          # Price-Comparison Service
│   ├── server.js             # POST /estimate Endpoint
│   ├── Dockerfile
│   └── package.json
├── mobile-app/               # React Native Expo Mobile App
│   ├── screens/
│   │   ├── CameraScreen.tsx  # Live-Kamera & Photo-Scan
│   │   ├── ResultScreen.tsx  # Klassifizierung & Preisvergleich
│   │   └── HistoryScreen.tsx # Transaktionsverlauf
│   ├── App.tsx
│   └── package.json
├── docker-compose.yml        # Docker-Orchestrierung aller Services & Postgres
└── README.md
```

---

## ⚡ Schnellstart mit Docker Compose

Die einfachste Methode, das gesamte Backend samt Datenbank und Microservices lokal zu starten:

```bash
# 1. Container bauen und starten
docker-compose up --build -d

# 2. Logs prüfen
docker-compose logs -f backend-gateway
```

Die Dienste laufen dann auf folgenden Ports:
- **Backend-Gateway**: `http://localhost:4000`
- **Vision-Service**: `http://localhost:4001`
- **Pricing-Service**: `http://localhost:4002`
- **Postgres Database**: `localhost:5432` (User: `postgres`, Pass: `postgrespassword`, DB: `antiques_db`)

---

## 📱 Mobile App (Expo / React Native) starten

```bash
cd mobile-app

# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariable für API Gateway setzen (oder in .env eintragen)
export EXPO_PUBLIC_GATEWAY_URL="http://192.168.x.x:4000" # Ersetze durch deine lokale IP

# 3. Expo Entwicklungs-Server starten
npm start
```

Anschließend mit der **Expo Go App** (iOS / Android) den QR-Code im Terminal scannen!

---

## 🔧 Manueller Start der Microservices (ohne Docker)

### 1. PostgreSQL Datenbank einrichten
```bash
psql -U postgres -c "CREATE DATABASE antiques_db;"
psql -U postgres -d antiques_db -f db/schema.sql
```

### 2. Vision Service (FastAPI)
```bash
cd vision-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 4001
```

### 3. Pricing Service (Node.js)
```bash
cd pricing-service
npm install
npm start
```

### 4. Backend Gateway (Node.js/Express)
```bash
cd backend-gateway
npm install
npm run dev
```

---

## 📡 API-Spezifikation (Backend Gateway)

### 1. Antiquität Scannen
**POST** `/scan`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `image`: Bilddatei (JPEG/PNG)
  - `userId`: String (z.B. `"user_42"`)

**Beispiel-Antwort**:
```json
{
  "scan": {
    "id": 1,
    "ts": "2026-07-31T10:30:00.000Z",
    "userId": "user_42"
  },
  "item": {
    "label": "Jugendstil-Vase mit floralem Dekor",
    "epoch": "1900-1910 (Jugendstil)",
    "material": "Glas / Bronze",
    "origin": "Deutschland / Frankreich",
    "confidence": 0.88
  },
  "pricing": {
    "stats": {
      "price_min": 180,
      "price_max": 520,
      "price_median": 340,
      "platform_count": 5
    },
    "offers": [
      {
        "platform": "Catawiki Kunst & Antiquitäten",
        "title": "Jugendstil-Vase - Auktionslos mit Zertifikat",
        "price": 380,
        "currency": "EUR",
        "condition": "Sehr gut",
        "url": "https://www.catawiki.com"
      }
    ]
  }
}
```

### 2. Alle Scans abrufen
**GET** `/scans`

### 3. Scan-Details abrufen
**GET** `/scan/:id`

---

## 💡 Anpassen der Preis-API
In `pricing-service/server.js` ist der Platzhalter für echte Marktplatz-APIs klar markiert. Du kannst dort deinen eigenen API-Key für Price-Comparison-APIs wie Ebay Partner Network, Google Shopping API, Barcode-Lookups oder Custom Scraper eintragen.
