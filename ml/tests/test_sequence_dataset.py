"""
ERROR 404 — Spatio-Temporal Dataset & Tensor Verification Tests
"""

import pytest
import torch
import numpy as np

from ml.spatiotemporal.dataset import SpatioTemporalPipeline

def test_spatiotemporal_dataset_shapes_and_splits():
    pipeline = SpatioTemporalPipeline(sequence_length=6, neighborhood_size=3)
    train_ds, val_ds, test_ds, scaler = pipeline.build_datasets()

    assert len(train_ds) > 0
    assert len(val_ds) > 0
    assert len(test_ds) > 0

    sample = train_ds[0]
    tensor = sample['tensor'] # [T, C, H, W]
    assert tensor.shape == (6, 8, 3, 3)
    assert sample['rain_target'].shape == (4,)
    assert sample['wind_target'].shape == (4,)
    assert sample['event_target'].shape == (3,)
    assert scaler.is_fitted is True

def test_scaler_zero_leakage_and_bounds():
    pipeline = SpatioTemporalPipeline(sequence_length=6, neighborhood_size=3)
    train_ds, _, _, scaler = pipeline.build_datasets()

    assert scaler.means is not None
    assert scaler.stds is not None
    assert len(scaler.means) == 8
    assert len(scaler.stds) == 8
