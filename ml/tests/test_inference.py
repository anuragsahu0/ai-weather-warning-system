"""
ERROR 404 — Python ML Inference & Freshness Unit Tests
"""

import pytest
from ml.data.schemas import PredictRequest, FeatureInput
from ml.inference.engine import inference_engine

def test_inference_with_fresh_features():
    req = PredictRequest(
        gridId='GRID_R01_N2861_E07720',
        gridCode='GRID_R01_N2861_E07720',
        task='HEAVY_RAIN',
        horizonMinutes=30,
        features=FeatureInput(
            temperature=31.2,
            humidity=85,
            pressure=998.0,
            windSpeed=22.0,
            rainfallRate=14.5,
            pressureTendencyHpaPerHr=-2.4,
            rollingRainAccum60m=20.0
        ),
        featureTimestamp='2026-08-22T17:30:00Z',
        dataFreshnessSeconds=120 # Fresh
    )

    res = inference_engine.predict(req)

    assert res.status == 'MODEL_READY'
    assert 0.0 <= res.probability <= 1.0
    assert isinstance(res.prediction, bool)
    assert len(res.topFeatures) > 0
    assert res.modelVersion != 'none'

def test_inference_stale_telemetry_rejection():
    req = PredictRequest(
        gridId='GRID_R01_N2861_E07720',
        gridCode='GRID_R01_N2861_E07720',
        task='HEAVY_RAIN',
        horizonMinutes=30,
        features=FeatureInput(temperature=30.0),
        featureTimestamp='2026-08-22T15:00:00Z',
        dataFreshnessSeconds=7200 # 2 hours old (Stale)
    )

    res = inference_engine.predict(req)

    assert res.status == 'STALE_INPUT_DATA'
    assert res.probability == 0.0
    assert 'stale' in res.explanationSummary.lower()
