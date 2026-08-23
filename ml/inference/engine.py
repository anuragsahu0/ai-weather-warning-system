"""
ERROR 404 — High Performance ML Inference Engine
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

from ml.data.schemas import PredictRequest, PredictResponse, ModelStatus, SeverityLevel
from ml.registry.model_registry import model_registry
from ml.evaluation.explainability import explain_prediction
from ml.data.dataset_loader import FEATURE_COLUMNS

MAX_FEATURE_AGE_SECONDS = 1800  # 30 Minutes

class InferenceEngine:
    def predict(self, req: PredictRequest) -> PredictResponse:
        now_iso = datetime.utcnow().isoformat() + 'Z'

        # 1. Freshness Check
        if req.dataFreshnessSeconds > MAX_FEATURE_AGE_SECONDS:
            return self._build_status_response(
                req=req,
                status='STALE_INPUT_DATA',
                summary=f"Input telemetry is {req.dataFreshnessSeconds}s old (> 30 min limit). Prediction halted to prevent stale inference.",
                now_iso=now_iso
            )

        # 2. Model Retrieval
        loaded = model_registry.load_model(req.task, req.horizonMinutes)
        if loaded is None:
            return self._build_status_response(
                req=req,
                status='MODEL_UNAVAILABLE',
                summary=f"No active baseline model registered for task {req.task} (horizon {req.horizonMinutes}m).",
                now_iso=now_iso
            )

        model, preprocessor, card = loaded

        # 3. Input Preparation
        feat_dict = req.features.model_dump()
        df_in = pd.DataFrame([{col: feat_dict.get(col) for col in FEATURE_COLUMNS}])

        try:
            X_scaled = preprocessor.transform(df_in)
            probs = model.predict_proba(X_scaled)
            p1 = float(probs[0, 1] if probs.ndim == 2 else probs[0])
            p1 = max(0.0, min(1.0, round(p1, 3)))

            th = card.metrics.decisionThreshold
            pred_bool = bool(p1 >= th)

            # Severity Mapping
            if p1 >= 0.8:
                sev: SeverityLevel = 'SEVERE' if req.task in ('HEAVY_RAIN', 'SEVERE_CONVECTIVE') else 'HIGH'
            elif p1 >= 0.5:
                sev = 'HIGH'
            elif p1 >= 0.25:
                sev = 'MODERATE'
            else:
                sev = 'LOW'

            # Explainability
            # Feature importance baseline approximation
            feat_imp_map = {
                'pressureTendencyHpaPerHr': 0.35,
                'rollingRainAccum60m': 0.25,
                'rainfallRate': 0.15,
                'windGust': 0.10,
                'humidity': 0.08,
                'tempDelta30m': 0.07,
            }
            top_feats, summary = explain_prediction(feat_dict, feat_imp_map, p1)

            return PredictResponse(
                id=f"pred-{uuid.uuid4().hex[:8]}",
                gridId=req.gridId,
                gridCode=req.gridCode,
                task=req.task,
                horizonMinutes=req.horizonMinutes,
                prediction=pred_bool,
                probability=p1,
                decisionThreshold=th,
                severityLevel=sev,
                modelVersion=card.modelVersion,
                algorithm=card.algorithm,
                generatedAt=now_iso,
                featureTimestamp=req.featureTimestamp,
                dataFreshnessSeconds=req.dataFreshnessSeconds,
                status='MODEL_READY',
                topFeatures=top_feats,
                explanationSummary=summary
            )

        except Exception as e:
            return self._build_status_response(
                req=req,
                status='INFERENCE_ERROR',
                summary=f"Inference execution failure: {str(e)}",
                now_iso=now_iso
            )

    def _build_status_response(
        self,
        req: PredictRequest,
        status: ModelStatus,
        summary: str,
        now_iso: str
    ) -> PredictResponse:
        return PredictResponse(
            id=f"pred-{uuid.uuid4().hex[:8]}",
            gridId=req.gridId,
            gridCode=req.gridCode,
            task=req.task,
            horizonMinutes=req.horizonMinutes,
            prediction=False,
            probability=0.0,
            decisionThreshold=0.5,
            severityLevel='LOW',
            modelVersion='none',
            algorithm='none',
            generatedAt=now_iso,
            featureTimestamp=req.featureTimestamp,
            dataFreshnessSeconds=req.dataFreshnessSeconds,
            status=status,
            topFeatures=[],
            explanationSummary=summary
        )

inference_engine = InferenceEngine()
