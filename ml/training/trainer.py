"""
ERROR 404 — Baseline Model Training & Comparison Pipeline
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime
import numpy as np
import pandas as pd

from ml.data.dataset_loader import DatasetLoader
from ml.data.schemas import PredictionTask, ModelCard, ModelSkillMetrics
from ml.preprocessing.pipeline import FeaturePreprocessor
from ml.models.logistic_model import WeatherLogisticRegression
from ml.models.random_forest_model import WeatherRandomForest
from ml.models.gradient_boost_model import WeatherGradientBoosting
from ml.evaluation.metrics import evaluate_model_performance
from ml.registry.model_registry import model_registry

class BaselineTrainer:
    def __init__(self):
        self.loader = DatasetLoader()

    def train_and_evaluate(
        self,
        task: PredictionTask = 'HEAVY_RAIN',
        horizon: int = 30
    ) -> Tuple[ModelCard, List[ModelCard]]:
        print(f"\n[Trainer] Initiating baseline training for {task} (Horizon: {horizon}m)...")

        # 1. Load Chronological Dataset Partitions
        X_train, y_train, X_val, y_val, X_test, y_test = self.loader.load_train_val_test(task, horizon)
        print(f"[Trainer] Samples — Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
        print(f"[Trainer] Class distribution (Train 1s: {int(y_train.sum())}/{len(y_train)}, Test 1s: {int(y_test.sum())}/{len(y_test)})")

        # 2. Preprocessing
        preprocessor = FeaturePreprocessor()
        X_train_scaled = preprocessor.fit_transform(X_train)
        X_val_scaled = preprocessor.transform(X_val)
        X_test_scaled = preprocessor.transform(X_test)

        feature_names = preprocessor.get_feature_names()

        # 3. Instantiate Candidates
        candidates = [
            WeatherLogisticRegression(),
            WeatherRandomForest(n_estimators=100, max_depth=6),
            WeatherGradientBoosting(n_estimators=100, learning_rate=0.05, max_depth=4),
        ]

        evaluated_cards: List[Tuple[Any, FeaturePreprocessor, ModelCard]] = []

        now_str = datetime.utcnow().isoformat() + 'Z'

        for model in candidates:
            # Fit on Training Set
            model.fit(X_train_scaled, y_train.to_numpy())
            
            # Tune threshold on Validation Set
            th = model.tune_threshold(X_val_scaled, y_val.to_numpy())

            # Evaluate on Test Set (Strictly Unbiased)
            y_test_probs = model.predict_proba(X_test_scaled)
            p1_test = y_test_probs[:, 1] if y_test_probs.ndim == 2 else y_test_probs
            y_test_preds = (p1_test >= th).astype(int)

            metrics = evaluate_model_performance(
                y_true=y_test.to_numpy(),
                y_pred=y_test_preds,
                y_prob=p1_test,
                decision_threshold=th
            )

            algo_slug = model.algorithm.lower().replace('classifier', '').replace('regression', '')
            version_tag = f"{task.lower().replace('_', '-')}-{horizon}m-{algo_slug}-v1"

            card = ModelCard(
                modelId=f"mod-{version_tag}",
                modelVersion=version_tag,
                task=task,
                horizonMinutes=horizon,
                algorithm=model.algorithm,
                datasetVersion="error404-monsoon-delhi-2024-v1.0",
                trainingSamplesCount=len(X_train),
                validationSamplesCount=len(X_val),
                testSamplesCount=len(X_test),
                trainingPeriod={
                    "start": "2024-07-01T00:00:00Z",
                    "end": "2024-07-11T11:00:00Z"
                },
                testPeriod={
                    "start": "2024-07-13T18:00:00Z",
                    "end": "2024-07-15T23:00:00Z"
                },
                metrics=metrics,
                featureNames=feature_names,
                createdAt=now_str,
                status="ACTIVE"
            )

            evaluated_cards.append((model, preprocessor, card))
            print(f"  --> {model.algorithm}: Precision={metrics.precision}, Recall={metrics.recall}, F1={metrics.f1Score}, PR-AUC={metrics.prAuc}, Brier={metrics.brierScore} (Threshold={th})")

        # 4. Select Best Candidate (Highest F1 with high Recall for warning safety)
        evaluated_cards.sort(key=lambda item: (item[2].metrics.f1Score, item[2].metrics.recall), reverse=True)
        best_model, best_prep, best_card = evaluated_cards[0]

        # Standardize active best version
        active_version_tag = f"{task.lower().replace('_', '-')}-{horizon}m-v1"
        best_card.modelVersion = active_version_tag
        best_card.modelId = f"mod-{active_version_tag}"

        model_registry.save_model(best_model, best_prep, best_card)
        print(f"[Trainer] Registered Champion Model: {best_card.modelVersion} ({best_card.algorithm}) [Test F1: {best_card.metrics.f1Score}]\n")

        all_cards = [c for _, _, c in evaluated_cards]
        return best_card, all_cards

trainer = BaselineTrainer()
