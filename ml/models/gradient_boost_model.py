"""
ERROR 404 — Gradient Boosting Classifier Baseline Model
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from sklearn.ensemble import GradientBoostingClassifier
import numpy as np
from ml.models.base import BaseWeatherModel

class WeatherGradientBoosting(BaseWeatherModel):
    def __init__(self, n_estimators: int = 100, learning_rate: float = 0.05, max_depth: int = 4, random_state: int = 42):
        super().__init__(name='Gradient Boosting Baseline', algorithm='GradientBoostingClassifier')
        self.model = GradientBoostingClassifier(
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            max_depth=max_depth,
            random_state=random_state
        )

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'WeatherGradientBoosting':
        self.model.fit(X, y)
        self.is_trained = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Model must be trained before inference")
        return self.model.predict_proba(X)
