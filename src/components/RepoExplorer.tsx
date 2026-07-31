import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, Layers, Server, Cpu, Database, Smartphone } from 'lucide-react';

interface FileEntry {
  path: string;
  name: string;
  service: 'gateway' | 'vision' | 'pricing' | 'db' | 'mobile' | 'docker' | 'readme';
  language: string;
  content: string;
}

export const REPO_FILES: FileEntry[] = [
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    service: 'docker',
    language: 'yaml',
    content: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: antiques-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: antiques_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  vision-service:
    build:
      context: ./vision-service
      dockerfile: Dockerfile
    ports:
      - "4001:4001"

  pricing-service:
    build:
      context: ./pricing-service
      dockerfile: Dockerfile
    ports:
      - "4002:4002"

  backend-gateway:
    build:
      context: ./backend-gateway
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DB_URL=postgresql://postgres:postgrespassword@postgres:5432/antiques_db
      - VISION_SERVICE_URL=http://vision-service:4001
      - PRICING_SERVICE_URL=http://pricing-service:4002
    depends_on:
      - postgres
      - vision-service
      - pricing-service

volumes:
  postgres_data:`
  },
  {
    path: 'backend-gateway/src/index.ts',
    name: 'index.ts (Express Gateway)',
    service: 'gateway',
    language: 'typescript',
    content: `import express, { Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import { pool } from './db';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const VISION_SERVICE_URL = process.env.VISION_SERVICE_URL || 'http://vision-service:4001';
const PRICING_SERVICE_URL = process.env.PRICING_SERVICE_URL || 'http://pricing-service:4002';

// POST /scan
app.post('/scan', upload.single('image'), async (req: Request, res: Response) => {
  const userId = req.body.userId || 'guest_user';
  const imageFile = req.file;

  // 1. Vision-Service aufrufen (POST http://vision-service:4001/classify)
  const formData = new FormData();
  const blob = new Blob([imageFile.buffer], { type: imageFile.mimetype });
  formData.append('image', blob, 'scan.jpg');

  const visionRes = await axios.post(\`\${VISION_SERVICE_URL}/classify\`, formData);
  const visionData = visionRes.data;

  // 2. Pricing-Service aufrufen (POST http://pricing-service:4002/estimate)
  const searchQuery = \`\${visionData.epoch} \${visionData.material} \${visionData.label}\`;
  const pricingRes = await axios.post(\`\${PRICING_SERVICE_URL}/estimate\`, {
    query: searchQuery,
    attributes: visionData
  });
  const pricingData = pricingRes.data;

  // 3. In Postgres speichern (items, price_snapshots, offers, scans)
  const itemRes = await pool.query(
    \`INSERT INTO items (label, epoch, material, origin) VALUES ($1, $2, $3, $4) RETURNING id\`,
    [visionData.label, visionData.epoch, visionData.material, visionData.origin]
  );
  const itemId = itemRes.rows[0].id;

  const snapRes = await pool.query(
    \`INSERT INTO price_snapshots (item_id, price_min, price_max, price_median, platform_count)
     VALUES ($1, $2, $3, $4, $5) RETURNING id\`,
    [itemId, pricingData.stats.price_min, pricingData.stats.price_max, pricingData.stats.price_median, pricingData.stats.platform_count]
  );
  const snapshotId = snapRes.rows[0].id;

  for (const off of pricingData.offers) {
    await pool.query(
      \`INSERT INTO offers (snapshot_id, platform, title, price, currency, condition, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)\`,
      [snapshotId, off.platform, off.title, off.price, off.currency, off.condition, off.url]
    );
  }

  const scanRes = await pool.query(
    \`INSERT INTO scans (user_id, item_id, snapshot_id) VALUES ($1, $2, $3) RETURNING id, ts\`,
    [userId, itemId, snapshotId]
  );

  return res.json({
    scan: { id: scanRes.rows[0].id, ts: scanRes.rows[0].ts, userId },
    item: visionData,
    pricing: pricingData
  });
});

app.listen(4000, () => console.log('Gateway online on port 4000'));`
  },
  {
    path: 'vision-service/app.py',
    name: 'app.py (FastAPI Vision)',
    service: 'vision',
    language: 'python',
    content: `from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import hashlib

app = FastAPI(title="Vision Service")

class ClassificationResult(BaseModel):
    label: str
    epoch: str
    material: str
    origin: str
    confidence: float

@app.post("/classify", response_model=ClassificationResult)
async def classify_antique(image: UploadFile = File(...)):
    content = await image.read()
    img_hash = hashlib.sha256(content).hexdigest()[:8]

    # Mock Vision KI-Klassifizierung
    return ClassificationResult(
        label="Jugendstil-Vase mit Irisierender Glasur",
        epoch="1900-1910 (Jugendstil)",
        material="Glas / Bronze",
        origin="DE/FR (Émile Gallé Stil)",
        confidence=0.88
    )`
  },
  {
    path: 'pricing-service/server.js',
    name: 'server.js (Price Comparison)',
    service: 'pricing',
    language: 'javascript',
    content: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/estimate', async (req, res) => {
  const { query } = req.body;
  
  // Generische Price-Comparison Normalisierung
  const stats = {
    price_min: 180,
    price_max: 520,
    price_median: 340,
    platform_count: 5
  };

  const offers = [
    { platform: 'Catawiki', title: \`\${query} Auktionslos\`, price: 380, currency: 'EUR', condition: 'Sehr gut', url: 'https://catawiki.com' },
    { platform: 'eBay', title: \`\${query} Vintage\`, price: 180, currency: 'EUR', condition: 'Gebraucht', url: 'https://ebay.de' }
  ];

  return res.json({ stats, offers });
});

app.listen(4002, () => console.log('Pricing service on port 4002'));`
  },
  {
    path: 'db/schema.sql',
    name: 'schema.sql (PostgreSQL DDL)',
    service: 'db',
    language: 'sql',
    content: `CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  epoch VARCHAR(100),
  material VARCHAR(100),
  origin VARCHAR(100),
  image_hash VARCHAR(64)
);

CREATE TABLE price_snapshots (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  ts TIMESTAMP NOT NULL DEFAULT NOW(),
  price_min NUMERIC(10, 2),
  price_max NUMERIC(10, 2),
  price_median NUMERIC(10, 2),
  platform_count INTEGER
);

CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  snapshot_id INTEGER REFERENCES price_snapshots(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  condition VARCHAR(100),
  url TEXT
);

CREATE TABLE scans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT 'guest_user',
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  snapshot_id INTEGER REFERENCES price_snapshots(id) ON DELETE CASCADE,
  ts TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT
);`
  },
  {
    path: 'mobile-app/screens/CameraScreen.tsx',
    name: 'CameraScreen.tsx (Expo React Native)',
    service: 'mobile',
    language: 'typescript',
    content: `import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const handleTakeScan = async () => {
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    const formData = new FormData();
    formData.append('image', { uri: photo.uri, name: 'scan.jpg', type: 'image/jpeg' } as any);

    const res = await fetch('http://localhost:4000/scan', { method: 'POST', body: formData });
    const data = await res.json();
    navigation.navigate('Result', { scanData: data });
  };

  return (
    <CameraView style={{ flex: 1 }} ref={cameraRef}>
      <TouchableOpacity style={styles.btn} onPress={handleTakeScan}>
        <Text style={styles.btnText}>Scannen</Text>
      </TouchableOpacity>
    </CameraView>
  );
}`
  }
];export const RepoExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileEntry>(REPO_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-4 sm:p-6 text-[#e0e0e0] shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-serif uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#c5a059]" />
            Projekt-Codebase & Repository Explorer
          </h2>
          <p className="text-[11px] text-white/40 uppercase tracking-tight">
            Vollständige Quellcodedateien der Microservices, Datenbank & Mobile App.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="px-4 py-2 bg-[#0a0a0a] hover:bg-white/5 text-[#c5a059] border border-white/10 rounded-sm text-xs font-serif uppercase tracking-widest font-bold transition-all flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Code kopiert!' : 'Datei kopieren'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File Tree Drawer */}
        <div className="bg-[#0a0a0a] p-3 rounded-sm border border-white/10 space-y-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 px-2 py-1 flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-[#c5a059]" />
            <span>Projektordner</span>
          </div>

          <div className="space-y-1">
            {REPO_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#c5a059] text-black font-bold shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Canvas */}
        <div className="lg:col-span-3 bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden flex flex-col">
          <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/70">
            <span className="text-[#c5a059] font-bold">{selectedFile.path}</span>
            <span className="text-[9px] bg-black/60 px-2 py-0.5 rounded-sm text-white/40 uppercase tracking-widest border border-white/10">
              {selectedFile.language}
            </span>
          </div>

          <pre className="p-4 overflow-x-auto font-mono text-xs text-white/80 leading-relaxed bg-[#0a0a0a] max-h-[500px]">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
