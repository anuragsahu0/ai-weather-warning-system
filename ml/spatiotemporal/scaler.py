"""
ERROR 404 — Multi-Channel Spatial Feature Scaler
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import os
from pathlib import Path
from typing import List, Optional, Union
import numpy as np
import joblib

class SpatialFeatureScaler:
    def __init__(self, version: str = "spatiotemporal-scaler-v1.0"):
        self.version = version
        self.means: Optional[np.ndarray] = None
        self.stds: Optional[np.ndarray] = None
        self.channel_names: List[str] = []
        self.is_fitted = False

    def fit(self, X: np.ndarray, channel_names: List[str]) -> 'SpatialFeatureScaler':
        """
        Fits mean and standard deviation per channel across training tensors.
        X shape: [N, T, C, H, W] or [N, C]
        """
        self.channel_names = list(channel_names)
        num_channels = len(channel_names)

        if X.ndim == 5:
            # Reshape to [-1, C]
            # Permute C to last dimension
            X_reshaped = np.transpose(X, (0, 1, 3, 4, 2)).reshape(-1, num_channels)
        elif X.ndim == 2:
            X_reshaped = X
        else:
            raise ValueError(f"Unsupported tensor shape for spatial feature scaling: {X.shape}")

        self.means = np.nanmean(X_reshaped, axis=0)
        self.stds = np.nanstd(X_reshaped, axis=0)
        # Avoid division by zero
        self.stds[self.stds == 0.0] = 1.0
        self.stds[np.isnan(self.stds)] = 1.0
        self.means[np.isnan(self.means)] = 0.0

        self.is_fitted = True
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted or self.means is None or self.stds is None:
            raise RuntimeError("SpatialFeatureScaler must be fitted before transform")

        X_out = np.copy(X)
        if X.ndim == 5:
            # X shape: [B, T, C, H, W]
            for c in range(len(self.channel_names)):
                X_out[:, :, c, :, :] = (X_out[:, :, c, :, :] - self.means[c]) / self.stds[c]
        elif X.ndim == 4:
            # X shape: [T, C, H, W]
            for c in range(len(self.channel_names)):
                X_out[:, c, :, :] = (X_out[:, c, :, :] - self.means[c]) / self.stds[c]
        elif X.ndim == 2:
            # X shape: [B, C]
            X_out = (X_out - self.means) / self.stds
        else:
            raise ValueError(f"Unsupported tensor shape for transform: {X.shape}")

        return np.nan_to_num(X_out, nan=0.0)

    def inverse_transform_channel(self, val: float, channel_name: str) -> float:
        if channel_name not in self.channel_names or self.means is None or self.stds is None:
            return val
        idx = self.channel_names.index(channel_name)
        return float(val * self.stds[idx] + self.means[idx])

    def save(self, filepath: Union[str, Path]) -> None:
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            'version': self.version,
            'means': self.means,
            'stds': self.stds,
            'channel_names': self.channel_names,
            'is_fitted': self.is_fitted
        }, filepath)

    @classmethod
    def load(cls, filepath: Union[str, Path]) -> 'SpatialFeatureScaler':
        data = joblib.load(filepath)
        scaler = cls(version=data['version'])
        scaler.means = data['means']
        scaler.stds = data['stds']
        scaler.channel_names = data['channel_names']
        scaler.is_fitted = data['is_fitted']
        return scaler
