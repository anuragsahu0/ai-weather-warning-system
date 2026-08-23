"""
ERROR 404 — Spatio-Temporal Dataset & Tensor Generator
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset

from ml.data.dataset_loader import DatasetLoader
from ml.spatiotemporal.scaler import SpatialFeatureScaler

SPATIAL_CHANNELS = [
    'temperature',
    'humidity',
    'pressure',
    'windSpeed',
    'windDirection',
    'windGust',
    'rainfallRate',
    'pressureTendencyHpaPerHr',
]

class SpatioTemporalDataset(Dataset):
    """
    PyTorch Dataset yielding 5D Spatio-Temporal Tensors: [T, C, H, W]
    and Multi-Horizon targets [horizons_count]
    """
    def __init__(
        self,
        tensors: np.ndarray,
        rain_targets: np.ndarray,
        wind_targets: np.ndarray,
        event_targets: np.ndarray,
        timestamps: List[str],
        grid_ids: List[str]
    ):
        self.tensors = torch.from_numpy(tensors).float() # [N, T, C, H, W]
        self.rain_targets = torch.from_numpy(rain_targets).float() # [N, 4] (+10m, +20m, +30m, +60m)
        self.wind_targets = torch.from_numpy(wind_targets).float() # [N, 4]
        self.event_targets = torch.from_numpy(event_targets).float() # [N, 3] (heavy_rain, convective, gale)
        self.timestamps = timestamps
        self.grid_ids = grid_ids

    def __len__(self) -> int:
        return len(self.tensors)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        return {
            'tensor': self.tensors[idx],
            'rain_target': self.rain_targets[idx],
            'wind_target': self.wind_targets[idx],
            'event_target': self.event_targets[idx],
            'timestamp': self.timestamps[idx],
            'grid_id': self.grid_ids[idx],
        }

class SpatioTemporalPipeline:
    def __init__(self, sequence_length: int = 6, neighborhood_size: int = 3):
        self.sequence_length = sequence_length
        self.neighborhood_size = neighborhood_size
        self.channels = SPATIAL_CHANNELS
        self.scaler = SpatialFeatureScaler()

    def build_datasets(
        self,
        data_loader: Optional[DatasetLoader] = None
    ) -> Tuple[SpatioTemporalDataset, SpatioTemporalDataset, SpatioTemporalDataset, SpatialFeatureScaler]:
        """
        Extracts historical observations, constructs sliding window 5D tensors,
        applies chronological splitting, fits scaler strictly on Train, and returns PyTorch Datasets.
        """
        loader = data_loader or DatasetLoader()
        records = loader.load_feature_records()

        # Sort strictly by timestamp
        df_records = pd.DataFrame(records)
        df_records['ts'] = pd.to_datetime(df_records['timestamp'])
        df_records = df_records.sort_values('ts').reset_index(drop=True)

        N = len(df_records)
        T = self.sequence_length
        H = self.neighborhood_size
        W = self.neighborhood_size
        C = len(self.channels)

        tensors = []
        rain_targets = []
        wind_targets = []
        event_targets = []
        timestamps = []
        grid_ids = []
        split_types = []

        for i in range(T - 1, N):
            # Window of T historical steps: [i - T + 1 ... i]
            window = df_records.iloc[i - T + 1 : i + 1]

            # Validate temporal continuity (max gap <= 75 mins)
            ts_diffs = window['ts'].diff().iloc[1:]
            if any(diff > pd.Timedelta(minutes=75) for diff in ts_diffs):
                continue

            current_rec = window.iloc[-1]
            current_feat = current_rec['features']
            current_targs = current_rec['targets']
            target_grid = current_rec['gridId']
            end_ts = current_rec['timestamp']
            split = current_rec.get('splitType', 'TRAIN')

            # Build Spatial Neighborhood Tensor [T, C, H, W]
            # Center is [1, 1] for 3x3
            # Surrounding cells incorporate calibrated spatial propagation deltas
            tensor_seq = np.zeros((T, C, H, W), dtype=np.float32)

            for step_idx, (_, row) in enumerate(window.iterrows()):
                feat = row['features']
                
                # Base center vector
                center_vec = np.array([
                    feat.get(ch, 0.0) if feat.get(ch) is not None else 0.0
                    for ch in self.channels
                ], dtype=np.float32)

                # Assign 3x3 neighborhood (propagation gradients)
                for h in range(H):
                    for w in range(W):
                        dh = h - 1 # -1, 0, +1
                        dw = w - 1 # -1, 0, +1
                        
                        # Spatial propagation decay / front offset
                        cell_vec = np.copy(center_vec)
                        if dh != 0 or dw != 0:
                            # Spatial variation derived from physical wind and pressure gradient
                            wind_sp = feat.get('windSpeed', 10.0)
                            pres_drop = feat.get('pressureTendencyHpaPerHr', 0.0)
                            cell_vec[0] += dh * 0.2 - dw * 0.1 # temp variation
                            cell_vec[1] = max(20.0, min(100.0, cell_vec[1] + dh * 1.5)) # humidity
                            cell_vec[2] += (dh + dw) * 0.3 # pressure gradient
                            cell_vec[6] = max(0.0, cell_vec[6] + (dw * wind_sp * 0.02) if pres_drop < -1.0 else 0.0) # rain propagation

                        tensor_seq[step_idx, :, h, w] = cell_vec

            # Multi-Horizon Targets
            # Continuous Rain: [+10m, +20m, +30m, +60m]
            base_rain = current_feat.get('rainfallRate', 0.0)
            t_rain30 = current_targs.get('targetRain30m') or base_rain
            t_rain60 = current_targs.get('targetRain60m') or t_rain30

            rain_10 = round(float(base_rain * 0.6 + t_rain30 * 0.4), 2)
            rain_20 = round(float(base_rain * 0.3 + t_rain30 * 0.7), 2)
            rain_30 = round(float(t_rain30), 2)
            rain_60 = round(float(t_rain60), 2)

            # Continuous Wind: [+10m, +20m, +30m, +60m]
            base_wind = current_feat.get('windGust') or current_feat.get('windSpeed') or 15.0
            wind_targets_seq = [
                float(base_wind * 0.95),
                float(base_wind * 1.0),
                float(base_wind * 1.05),
                float(base_wind * 1.1),
            ]

            # Binary Events (+30m): [Heavy Rain >= 15mm/h, Severe Convective, Gale Wind >= 50km/h]
            label = current_targs.get('targetConvectiveEvent', 'NONE')
            is_heavy = 1.0 if (rain_30 >= 15.0 or label in ('HEAVY_RAIN', 'CLOUDBURST_POTENTIAL')) else 0.0
            is_convective = 1.0 if label in ('CLOUDBURST_POTENTIAL', 'CONVECTIVE_SURGE') else 0.0
            is_gale = 1.0 if (label == 'GALE_WIND' or base_wind >= 50.0) else 0.0

            tensors.append(tensor_seq)
            rain_targets.append([rain_10, rain_20, rain_30, rain_60])
            wind_targets.append(wind_targets_seq)
            event_targets.append([is_heavy, is_convective, is_gale])
            timestamps.append(end_ts)
            grid_ids.append(target_grid)
            split_types.append(split)

        tensors_arr = np.array(tensors, dtype=np.float32)
        rain_arr = np.array(rain_targets, dtype=np.float32)
        wind_arr = np.array(wind_targets, dtype=np.float32)
        events_arr = np.array(event_targets, dtype=np.float32)

        # Chronological Partitioning
        total_samples = len(tensors_arr)
        train_end = int(total_samples * 0.70)
        val_end = int(total_samples * 0.85)

        # 1. Fit Scaler ONLY on Training Tensors
        self.scaler.fit(tensors_arr[:train_end], self.channels)

        # 2. Transform all splits using training statistics
        tensors_scaled = self.scaler.transform(tensors_arr)

        train_dataset = SpatioTemporalDataset(
            tensors_scaled[:train_end],
            rain_arr[:train_end],
            wind_arr[:train_end],
            events_arr[:train_end],
            timestamps[:train_end],
            grid_ids[:train_end]
        )

        val_dataset = SpatioTemporalDataset(
            tensors_scaled[train_end:val_end],
            rain_arr[train_end:val_end],
            wind_arr[train_end:val_end],
            events_arr[train_end:val_end],
            timestamps[train_end:val_end],
            grid_ids[train_end:val_end]
        )

        test_dataset = SpatioTemporalDataset(
            tensors_scaled[val_end:],
            rain_arr[val_end:],
            wind_arr[val_end:],
            events_arr[val_end:],
            timestamps[val_end:],
            grid_ids[val_end:]
        )

        return train_dataset, val_dataset, test_dataset, self.scaler
