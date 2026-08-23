"""
ERROR 404 — Spatio-Temporal PyTorch Unit Tests
"""

import pytest
import torch
import numpy as np

from ml.models.convlstm import ConvLSTMNowcaster
from ml.models.device import get_optimal_device
from ml.inference.spatiotemporal_engine import spatiotemporal_engine

def test_convlstm_forward_pass_shape():
    device = get_optimal_device()
    model = ConvLSTMNowcaster(
        input_channels=8,
        hidden_channels=16,
        num_horizons=4,
        num_events=3
    ).to(device)

    # Batch of 2, 6 time steps, 8 channels, 3x3 spatial grid
    dummy_input = torch.randn(2, 6, 8, 3, 3, device=device)

    rain_pred, wind_pred, event_probs = model(dummy_input)

    assert rain_pred.shape == (2, 4)
    assert wind_pred.shape == (2, 4)
    assert event_probs.shape == (2, 3)
    assert torch.all(rain_pred >= 0.0), "Rainfall prediction must be non-negative"
    assert torch.all((event_probs >= 0.0) & (event_probs <= 1.0)), "Event probabilities must be bounded [0, 1]"

def test_monte_carlo_uncertainty_bounds():
    device = get_optimal_device()
    model = ConvLSTMNowcaster(input_channels=8, hidden_channels=16).to(device)
    dummy_input = torch.randn(1, 6, 8, 3, 3, device=device)

    mc_res = model.predict_with_uncertainty(dummy_input, num_mc_samples=15)

    assert 'rain_mean' in mc_res
    assert 'rain_lower_90' in mc_res
    assert 'rain_upper_90' in mc_res
    assert 'uncertainty_score' in mc_res

    for mean, lower, upper in zip(mc_res['rain_mean'], mc_res['rain_lower_90'], mc_res['rain_upper_90']):
        assert lower <= mean <= upper, f"Confidence interval violated: {lower} <= {mean} <= {upper}"

def test_inference_with_mock_sequence():
    history = [
        {
            'features': {
                'temperature': 32.0,
                'humidity': 85.0,
                'pressure': 998.0,
                'windSpeed': 22.0,
                'windDirection': 180,
                'windGust': 35.0,
                'rainfallRate': 8.0,
                'pressureTendencyHpaPerHr': -2.1,
            },
            'timestamp': f"2026-08-22T{12+i}:00:00Z"
        }
        for i in range(6)
    ]

    res = spatiotemporal_engine.predict(
        grid_id='GRID_R01_N2861_E07720',
        grid_code='GRID_R01_N2861_E07720',
        history_sequence=history,
        data_freshness_seconds=120
    )

    assert res['status'] == 'MODEL_READY'
    assert len(res['horizons']) == 4
    assert res['modelType'] == 'ConvLSTM'
    assert len(res['explainability']['spatialRiskContributions']) == 9
