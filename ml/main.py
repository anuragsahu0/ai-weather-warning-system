"""
ERROR 404 — Python ML Microservice Entry Point
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import uvicorn
from ml.api import app

if __name__ == "__main__":
    print("Starting ERROR 404 ML Microservice on port 8000...")
    uvicorn.run("ml.api:app", host="0.0.0.0", port=8000, reload=True)
