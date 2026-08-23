"""
ERROR 404 — Spatio-Temporal Nowcasting Training Pipeline
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import os
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np

from ml.spatiotemporal.dataset import SpatioTemporalPipeline, SPATIAL_CHANNELS
from ml.models.convlstm import ConvLSTMNowcaster
from ml.models.device import get_optimal_device, get_device_name
from ml.evaluation.spatiotemporal_metrics import evaluate_spatiotemporal_model, generate_benchmark_comparison
from ml.registry.model_registry import model_registry

class SpatioTemporalTrainer:
    def __init__(
        self,
        sequence_length: int = 6,
        neighborhood_size: int = 3,
        batch_size: int = 16,
        learning_rate: float = 1e-3,
        epochs: int = 40,
        model_version: str = "spatiotemporal-convlstm-v1"
    ):
        self.sequence_length = sequence_length
        self.neighborhood_size = neighborhood_size
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.model_version = model_version
        self.device = get_optimal_device()

    def train_and_evaluate(self) -> Dict[str, Any]:
        print("================================================================")
        print("   ERROR 404 — Phase 6 Spatio-Temporal Training Pipeline")
        print(f"   Target Device: {get_device_name(self.device)}")
        print("================================================================\n")

        # 1. Build Chronological Datasets & Spatial Scaler
        pipeline = SpatioTemporalPipeline(
            sequence_length=self.sequence_length,
            neighborhood_size=self.neighborhood_size
        )
        train_ds, val_ds, test_ds, scaler = pipeline.build_datasets()

        print(f"[Dataset] Sequence Length: {self.sequence_length} steps | Spatial Grid: {self.neighborhood_size}x{self.neighborhood_size}")
        print(f"[Dataset] Chronological Partitions — Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}")

        train_loader = DataLoader(train_ds, batch_size=self.batch_size, shuffle=False)
        val_loader = DataLoader(val_ds, batch_size=self.batch_size, shuffle=False)
        test_loader = DataLoader(test_ds, batch_size=self.batch_size, shuffle=False)

        # 2. Instantiate ConvLSTM Neural Network
        model = ConvLSTMNowcaster(
            input_channels=len(SPATIAL_CHANNELS),
            hidden_channels=32,
            num_horizons=4,
            num_events=3,
            dropout_prob=0.2
        ).to(self.device)

        # 3. Loss Functions & Optimizer
        huber_loss = nn.HuberLoss(delta=1.0)
        bce_loss = nn.BCELoss()

        optimizer = torch.optim.AdamW(model.parameters(), lr=self.learning_rate, weight_decay=1e-4)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=4)

        # 4. Training Loop with Early Stopping
        best_val_loss = float('inf')
        best_model_weights = None
        patience = 10
        patience_counter = 0

        for epoch in range(1, self.epochs + 1):
            model.train()
            train_loss = 0.0

            for batch in train_loader:
                tensors = batch['tensor'].to(self.device)
                rain_target = batch['rain_target'].to(self.device)
                wind_target = batch['wind_target'].to(self.device)
                event_target = batch['event_target'].to(self.device)

                optimizer.zero_grad()
                r_pred, w_pred, e_pred = model(tensors)

                loss_rain = huber_loss(r_pred, rain_target)
                loss_wind = huber_loss(w_pred, wind_target) * 0.1
                loss_event = bce_loss(e_pred, event_target) * 3.0

                total_loss = loss_rain + loss_wind + loss_event
                total_loss.backward()

                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()

                train_loss += total_loss.item() * len(tensors)

            train_loss /= len(train_ds)

            # Validation Pass
            model.eval()
            val_loss = 0.0
            with torch.no_grad():
                for batch in val_loader:
                    tensors = batch['tensor'].to(self.device)
                    rain_target = batch['rain_target'].to(self.device)
                    wind_target = batch['wind_target'].to(self.device)
                    event_target = batch['event_target'].to(self.device)

                    r_pred, w_pred, e_pred = model(tensors)

                    loss_rain = huber_loss(r_pred, rain_target)
                    loss_wind = huber_loss(w_pred, wind_target) * 0.1
                    loss_event = bce_loss(e_pred, event_target) * 3.0

                    total_loss = loss_rain + loss_wind + loss_event
                    val_loss += total_loss.item() * len(tensors)

            val_loss /= len(val_ds)
            scheduler.step(val_loss)

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_model_weights = {k: v.cpu().clone() for k, v in model.state_dict().items()}
                patience_counter = 0
            else:
                patience_counter += 1

            if epoch % 5 == 0 or epoch == self.epochs or patience_counter >= patience:
                print(f"[Epoch {epoch:02d}/{self.epochs}] Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} (Best: {best_val_loss:.4f})")

            if patience_counter >= patience:
                print(f"[Early Stopping] Validation loss plateaued for {patience} epochs. Stopping.")
                break

        # Load Champion Checkpoint
        if best_model_weights is not None:
            model.load_state_dict({k: v.to(self.device) for k, v in best_model_weights.items()})

        # 5. Evaluate on strictly Unseen Test Partition
        model.eval()
        test_r_preds = []
        test_r_trues = []
        test_e_preds = []
        test_e_trues = []

        with torch.no_grad():
            for batch in test_loader:
                tensors = batch['tensor'].to(self.device)
                r_pred, _, e_pred = model(tensors)

                test_r_preds.append(r_pred.cpu().numpy())
                test_r_trues.append(batch['rain_target'].numpy())
                test_e_preds.append(e_pred.cpu().numpy())
                test_e_trues.append(batch['event_target'].numpy())

        r_preds_arr = np.concatenate(test_r_preds, axis=0)
        r_trues_arr = np.concatenate(test_r_trues, axis=0)
        e_preds_arr = np.concatenate(test_e_preds, axis=0)
        e_trues_arr = np.concatenate(test_e_trues, axis=0)

        test_metrics = evaluate_spatiotemporal_model(
            rain_true=r_trues_arr,
            rain_pred=r_preds_arr,
            event_true=e_trues_arr,
            event_probs=e_preds_arr,
            decision_threshold=0.20
        )

        print("\n[Test Evaluation — Strictly Chronological Unseen Test Split]")
        print(f"  --> Continuous Rainfall MAE: {test_metrics['rainfallMae']} mm/h")
        print(f"  --> Continuous Rainfall RMSE: {test_metrics['rainfallRmse']} mm/h")
        print(f"  --> Severe Rain (+30m) Precision: {test_metrics['precision']}")
        print(f"  --> Severe Rain (+30m) Recall: {test_metrics['recall']}")
        print(f"  --> Severe Rain (+30m) F1-Score: {test_metrics['f1Score']}")
        print(f"  --> Severe Rain (+30m) Brier Score: {test_metrics['brierScore']}")

        # 6. Save Artifacts to Model Registry
        artifact_dir = Path(os.getcwd()) / 'ml' / 'registry' / 'artifacts' / self.model_version
        artifact_dir.mkdir(parents=True, exist_ok=True)

        model_path = artifact_dir / 'model.pt'
        scaler_path = artifact_dir / 'scaler.joblib'
        card_path = artifact_dir / 'model_card.json'

        torch.save(model.state_dict(), model_path)
        scaler.save(scaler_path)

        now_iso = datetime.now(timezone.utc).isoformat()

        model_card = {
            'modelId': f"mod-{self.model_version}",
            'modelVersion': self.model_version,
            'modelType': 'ConvLSTM',
            'datasetVersion': 'error404-monsoon-delhi-2024-v1.0',
            'featureScalerVersion': scaler.version,
            'inputSequenceLength': self.sequence_length,
            'spatialNeighborhoodSize': f"{self.neighborhood_size}x{self.neighborhood_size} (1.1km grid)",
            'horizons': [10, 20, 30, 60],
            'channels': SPATIAL_CHANNELS,
            'trainingSamplesCount': len(train_ds),
            'validationSamplesCount': len(val_ds),
            'testSamplesCount': len(test_ds),
            'trainingPeriod': {
                'start': '2024-07-01T00:00:00Z',
                'end': '2024-07-11T11:00:00Z'
            },
            'testPeriod': {
                'start': '2024-07-13T18:00:00Z',
                'end': '2024-07-15T23:00:00Z'
            },
            'metrics': test_metrics,
            'createdAt': now_iso,
            'status': 'ACTIVE'
        }

        with open(card_path, 'w', encoding='utf-8') as f:
            json.dump(model_card, f, indent=2)

        # 7. Generate Benchmark Comparison against Phase 5 Baseline
        baseline_models = model_registry.list_models()
        baseline_hr = next((m for m in baseline_models if m.task == 'HEAVY_RAIN' and m.horizonMinutes == 30), None)
        baseline_dict = baseline_hr.model_dump() if baseline_hr else {}

        comparison = generate_benchmark_comparison(baseline_dict, test_metrics)
        comp_path = artifact_dir / 'comparison.json'
        with open(comp_path, 'w', encoding='utf-8') as f:
            json.dump(comparison, f, indent=2)

        print(f"\n[Registry] Model artifacts serialized to {artifact_dir}")
        print(f"[Comparison] F1 Delta vs Phase 5 Baseline: {comparison['performanceDelta']['f1DeltaPct']}%")

        return {
            'modelCard': model_card,
            'comparison': comparison,
            'metrics': test_metrics
        }

spatiotemporal_trainer = SpatioTemporalTrainer()

if __name__ == '__main__':
    spatiotemporal_trainer.train_and_evaluate()
