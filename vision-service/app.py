import hashlib
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Antiques Vision Classification Service",
    version="1.0.0",
    description="Microservice zur Bildanalyse und Epochenbestimmung von Antiquitäten"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClassificationResult(BaseModel):
    label: str
    epoch: str
    material: str
    origin: str
    confidence: float
    image_hash: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "vision-service"}

@app.post("/classify", response_model=ClassificationResult)
async def classify_antique(image: UploadFile = File(...)):
    """
    Empfängt ein Bildfile und liefert KI-Klassifizierungsinformationen zurück.
    Derzeit mit intelligenter Mock- / Platzhalterlogik basierend auf Dateihash.
    """
    try:
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="Leeres Bild übergeben")
        
        # Erzeuge Hash des Bildes
        img_hash = hashlib.sha256(content).hexdigest()[:16]

        # Vordefinierte Antiquitäten-Typen als heuristische Mock-Antworten
        mock_templates = [
            {
                "label": "Jugendstil-Vase mit Irisierender Glasur",
                "epoch": "1900-1910 (Jugendstil)",
                "material": "Glas / Bronze",
                "origin": "DE / FR (Émile Gallé / Tiffany)",
                "confidence": 0.88
            },
            {
                "label": "Biedermeier Standuhr mit Schlagwerk",
                "epoch": "1820-1840 (Biedermeier)",
                "material": "Nussbaum & Messing",
                "origin": "Österreich (Wien)",
                "confidence": 0.91
            },
            {
                "label": "Art Déco Tischlampe mit Skulptur",
                "epoch": "1925-1935 (Art Déco)",
                "material": "Gussbronze & Opalglas",
                "origin": "Frankreich (Paris)",
                "confidence": 0.84
            },
            {
                "label": "Meissen Porzellan-Anbietschale",
                "epoch": "1880-1900 (Historismus)",
                "material": "Porzellan mit Poliergold",
                "origin": "Deutschland (Sachsen)",
                "confidence": 0.93
            }
        ]

        # Auswählen basierend auf Hash-Wert
        index = int(img_hash, 16) % len(mock_templates)
        result = mock_templates[index]

        return ClassificationResult(
            label=result["label"],
            epoch=result["epoch"],
            material=result["material"],
            origin=result["origin"],
            confidence=result["confidence"],
            image_hash=img_hash
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision Fehler: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 4001))
    uvicorn.run(app, host="0.0.0.0", port=port)
