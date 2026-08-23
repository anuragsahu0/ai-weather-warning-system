"""
ERROR 404 — Python ML Future Feature Leakage Unit Tests
"""

import pytest
import pandas as pd
from ml.data.dataset_loader import DatasetLoader

def test_no_temporal_leakage_in_splits():
    loader = DatasetLoader()
    records = loader.load_feature_records()
    
    train_recs = [r for r in records if r.get('splitType') == 'TRAIN']
    val_recs = [r for r in records if r.get('splitType') == 'VAL']
    test_recs = [r for r in records if r.get('splitType') == 'TEST']

    max_train = max([pd.Timestamp(r['timestamp']) for r in train_recs])
    min_val = min([pd.Timestamp(r['timestamp']) for r in val_recs])
    max_val = max([pd.Timestamp(r['timestamp']) for r in val_recs])
    min_test = min([pd.Timestamp(r['timestamp']) for r in test_recs])

    assert max_train < min_val, "Train timestamps leak into validation partition!"
    assert max_val < min_test, "Validation timestamps leak into test partition!"
