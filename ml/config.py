"""
ERROR 404 — ML Service Configuration
"""

import os
from pydantic import BaseModel


class MLConfig(BaseModel):
    SERVICE_NAME: str = "ERROR 404 — ML Severe Weather Nowcast Engine"
    VERSION: str = "1.0.0-phase1"
    PORT: int = int(os.getenv("ML_PORT", "8000"))
    HOST: str = os.getenv("ML_HOST", "0.0.0.0")
    MODEL_WEIGHTS_DIR: str = os.getenv("MODEL_WEIGHTS_DIR", "./models/weights")
    PREDICTION_HORIZON_MINUTES: int = 360  # 0-6 hours
    GRID_RESOLUTION_KM: float = 1.0


config = MLConfig()
