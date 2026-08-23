"""
ERROR 404 — Random Forest Classifier Baseline Model
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from sklearn.ensemble import RandomForestClassifier
import numpy as np
from ml.models.base import BaseWeatherModel

class WeatherRandomForest(BaseWeatherModel):
    def __init__(self, n_estimators: int = 100, max_depth: int = 6, random_state: int = 42):
        super().__init__(name='Random Forest Baseline', algorithm='RandomForestClassifier')
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            class_weight='balanced',
            random_state=random_state,
            n_jobs=-1
        )

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'WeatherRandomForest':
        self.model.fit(X, y)
        self.is_trained = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Model must be trained before inference")
        return self.model.predict_proba(X)
