"""
ERROR 404 — Base Baseline Weather Model
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import numpy as np

class BaseWeatherModel(ABC):
    def __init__(self, name: str, algorithm: str):
        self.name = name
        self.algorithm = algorithm
        self.decision_threshold = 0.5
        self.is_trained = False

    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'BaseWeatherModel':
        pass

    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        pass

    def predict(self, X: np.ndarray) -> np.ndarray:
        probas = self.predict_proba(X)
        if probas.ndim == 2:
            return (probas[:, 1] >= self.decision_threshold).astype(int)
        return (probas >= self.decision_threshold).astype(int)

    def tune_threshold(self, X_val: np.ndarray, y_val: np.ndarray, metric: str = 'f1') -> float:
        """
        Tunes decision threshold on Validation partition to optimize early warning skill score.
        """
        probas = self.predict_proba(X_val)
        p1 = probas[:, 1] if probas.ndim == 2 else probas

        best_th = 0.5
        best_score = -1.0

        for th in np.linspace(0.1, 0.9, 41):
            preds = (p1 >= th).astype(int)
            tp = np.sum((preds == 1) & (y_val == 1))
            fp = np.sum((preds == 1) & (y_val == 0))
            fn = np.sum((preds == 0) & (y_val == 1))

            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

            if f1 > best_score:
                best_score = f1
                best_th = round(float(th), 2)

        self.decision_threshold = best_th if best_score > 0 else 0.5
        return self.decision_threshold
