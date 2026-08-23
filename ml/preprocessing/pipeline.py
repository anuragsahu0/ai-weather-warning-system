"""
ERROR 404 — ML Preprocessing Pipeline
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import Tuple
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

class FeaturePreprocessor:
    def __init__(self):
        self.imputer = SimpleImputer(strategy='median')
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_fitted = False

    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        self.feature_names = list(X.columns)
        X_clean = self._clean_and_validate(X)

        # Impute
        X_imp = self.imputer.fit_transform(X_clean)
        # Scale
        X_scaled = self.scaler.fit_transform(X_imp)
        self.is_fitted = True
        return X_scaled

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Preprocessor must be fitted before transform")
        X_clean = self._clean_and_validate(X)

        X_imp = self.imputer.transform(X_clean)
        X_scaled = self.scaler.transform(X_imp)
        return X_scaled

    def _clean_and_validate(self, X: pd.DataFrame) -> pd.DataFrame:
        if X is None or len(X) == 0:
            raise ValueError("Input DataFrame is empty")

        df = X.copy()
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        return df

    def get_feature_names(self) -> list:
        return self.feature_names
