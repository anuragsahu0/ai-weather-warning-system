"""
ERROR 404 — Python ML Training & Metric Unit Tests
"""

import pytest
import numpy as np
from ml.data.dataset_loader import DatasetLoader
from ml.training.trainer import trainer
from ml.evaluation.metrics import evaluate_model_performance
from ml.registry.model_registry import model_registry

def test_dataset_loader_chronological_splits():
    loader = DatasetLoader()
    X_train, y_train, X_val, y_val, X_test, y_test = loader.load_train_val_test('HEAVY_RAIN', 30)

    assert len(X_train) == 252
    assert len(X_val) == 54
    assert len(X_test) == 54
    assert len(X_train.columns) == 22

def test_baseline_training_execution():
    best_card, all_cards = trainer.train_and_evaluate(task='HEAVY_RAIN', horizon=30)
    
    assert best_card is not None
    assert len(all_cards) == 3
    assert best_card.metrics.precision >= 0.0
    assert best_card.metrics.recall >= 0.0
    assert best_card.metrics.brierScore >= 0.0

def test_metric_calculation_bounds():
    y_true = np.array([0, 1, 1, 0, 1])
    y_pred = np.array([0, 1, 1, 0, 0])
    y_prob = np.array([0.1, 0.9, 0.8, 0.2, 0.4])

    metrics = evaluate_model_performance(y_true, y_pred, y_prob, 0.5)

    assert 0.0 <= metrics.precision <= 1.0
    assert 0.0 <= metrics.recall <= 1.0
    assert 0.0 <= metrics.f1Score <= 1.0
    assert 0.0 <= metrics.brierScore <= 1.0
    assert metrics.confusionMatrix.truePositives == 2
    assert metrics.confusionMatrix.falseNegatives == 1
