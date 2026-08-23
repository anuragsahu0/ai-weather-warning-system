"""
ERROR 404 — Calibrated Logistic Regression Baseline Model
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from sklearn.linear_model import LogisticRegression
import numpy as np
from ml.models.base import BaseWeatherModel

class WeatherLogisticRegression(BaseWeatherModel):
    def __init__(self, C: float = 1.0, max_iter: int = 1000, random_state: int = 42):
        super().__init__(name='Logistic Regression Baseline', algorithm='LogisticRegression')
        self.model = LogisticRegression(
            C=C,
            max_iter=max_iter,
            class_weight='balanced',
            random_state=random_state,
            solver='lbfgs'
        )

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'WeatherLogisticRegression':
        self.model.fit(X, y)
        self.is_trained = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Model must be trained before inference")
        return self.model.predict_proba(X)
