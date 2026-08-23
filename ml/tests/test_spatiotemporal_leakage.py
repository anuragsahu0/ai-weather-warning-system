"""
ERROR 404 — Spatio-Temporal Future Feature Leakage Verification Tests
"""

import pytest
import pandas as pd
from ml.spatiotemporal.dataset import SpatioTemporalPipeline

def test_spatiotemporal_strict_temporal_integrity():
    pipeline = SpatioTemporalPipeline(sequence_length=6, neighborhood_size=3)
    train_ds, val_ds, test_ds, _ = pipeline.build_datasets()

    max_train_ts = max([pd.Timestamp(train_ds[i]['timestamp']) for i in range(len(train_ds))])
    min_val_ts = min([pd.Timestamp(val_ds[i]['timestamp']) for i in range(len(val_ds))])
    max_val_ts = max([pd.Timestamp(val_ds[i]['timestamp']) for i in range(len(val_ds))])
    min_test_ts = min([pd.Timestamp(test_ds[i]['timestamp']) for i in range(len(test_ds))])

    assert max_train_ts < min_val_ts, "Training sequences leak into validation partition!"
    assert max_val_ts < min_test_ts, "Validation sequences leak into test partition!"
