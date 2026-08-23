"""
ERROR 404 — ML Dataset Loader
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import json
import os
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional, Union
import pandas as pd
import numpy as np

from ml.data.schemas import PredictionTask

FEATURE_COLUMNS = [
    'temperature',
    'feelsLike',
    'humidity',
    'pressure',
    'windSpeed',
    'windDirection',
    'windGust',
    'rainfallRate',
    'cloudCover',
    'tempDelta30m',
    'pressureDelta30m',
    'humidityDelta30m',
    'windSpeedDelta30m',
    'pressureTendencyHpaPerHr',
    'rollingRainAccum30m',
    'rollingRainAccum60m',
    'rollingMeanTemp60m',
    'rollingMaxWind60m',
    'hourSin',
    'hourCos',
    'dayOfYearSin',
    'dayOfYearCos',
]

PathType = Optional[Union[str, Path]]

class DatasetLoader:
    def __init__(self, data_root: PathType = None):
        if data_root is None:
            self.data_root = Path(os.getcwd()) / 'data'
        else:
            self.data_root = Path(data_root)

    def load_feature_records(self) -> List[Dict[str, Any]]:
        features_dir = self.data_root / 'features'
        if features_dir.exists():
            feature_files = list(features_dir.glob('*.json'))
            if feature_files:
                with open(feature_files[0], 'r', encoding='utf-8') as f:
                    return json.load(f)

        return self._generate_baseline_feature_sequence()

    def load_train_val_test(
        self, task: PredictionTask = 'HEAVY_RAIN', horizon: int = 30
    ) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
        records = self.load_feature_records()
        
        # Flatten records to DataFrame
        rows = []
        for r in records:
            feat = r.get('features', {})
            targs = r.get('targets', {})
            split = r.get('splitType', 'TRAIN')
            timestamp = r.get('timestamp')

            row = {col: feat.get(col) for col in FEATURE_COLUMNS}
            row['timestamp'] = timestamp
            row['splitType'] = split
            
            # Map Binary Target Label based on Task
            label = targs.get('targetConvectiveEvent', 'NONE')
            rain_val = targs.get('targetRain30m') or 0.0
            wind_val = feat.get('windGust') or feat.get('windSpeed') or 0.0

            if task == 'HEAVY_RAIN':
                row['target'] = 1 if (rain_val >= 15.0 or label in ('HEAVY_RAIN', 'CLOUDBURST_POTENTIAL')) else 0
            elif task == 'SEVERE_CONVECTIVE':
                row['target'] = 1 if label in ('CLOUDBURST_POTENTIAL', 'CONVECTIVE_SURGE') else 0
            elif task == 'GALE_WIND':
                row['target'] = 1 if (label == 'GALE_WIND' or wind_val >= 50.0) else 0
            else:
                row['target'] = 0

            rows.append(row)

        df = pd.DataFrame(rows)
        df = df.sort_values(by='timestamp').reset_index(drop=True)

        train_df = df[df['splitType'] == 'TRAIN'].copy()
        val_df = df[df['splitType'] == 'VAL'].copy()
        test_df = df[df['splitType'] == 'TEST'].copy()

        # Fallback split if splitType not set
        if len(val_df) == 0 or len(test_df) == 0:
            n = len(df)
            train_end = int(n * 0.7)
            val_end = int(n * 0.85)
            train_df = df.iloc[:train_end].copy()
            val_df = df.iloc[train_end:val_end].copy()
            test_df = df.iloc[val_end:].copy()

        X_train, y_train = train_df[FEATURE_COLUMNS], train_df['target'].astype(int)
        X_val, y_val = val_df[FEATURE_COLUMNS], val_df['target'].astype(int)
        X_test, y_test = test_df[FEATURE_COLUMNS], test_df['target'].astype(int)

        return X_train, y_train, X_val, y_val, X_test, y_test

    def _generate_baseline_feature_sequence(self) -> List[Dict[str, Any]]:
        records = []
        base_time = pd.Timestamp('2024-07-01T00:00:00Z')
        
        np.random.seed(42)
        temp = 32.0
        pres = 1004.0
        hum = 75.0

        for i in range(360):
            ts = base_time + pd.Timedelta(hours=i)
            iso = ts.isoformat()
            
            diurnal = np.sin(2 * np.pi * (ts.hour / 24.0))
            is_storm = (i in range(120, 132)) or (i in range(260, 275)) or (i in range(310, 318))
            is_gale_gust = (i in (45, 46, 125, 126, 268, 269, 314))

            if is_storm:
                pres_drop = -2.5 + np.random.normal(0, 0.4)
                rain = 22.0 + np.random.exponential(15.0)
                wind = 54.0 + np.random.normal(0, 4.0) if is_gale_gust else 38.0 + np.random.normal(0, 5.0)
                temp -= 1.5
                hum = min(100.0, hum + 10.0)
            elif is_gale_gust:
                pres_drop = -1.2
                rain = 4.0
                wind = 52.0 + np.random.normal(0, 3.0)
            else:
                pres_drop = np.random.normal(0, 0.3)
                rain = 0.0 if np.random.random() > 0.15 else np.random.uniform(0.5, 4.0)
                wind = 12.0 + np.random.normal(0, 3.0)
                temp = 30.0 + diurnal * 4.0 + np.random.normal(0, 0.5)
                hum = 75.0 - diurnal * 10.0 + np.random.normal(0, 2.0)

            pres = max(985.0, min(1020.0, pres + pres_drop * 0.2))
            
            split = 'TRAIN' if i < 252 else ('VAL' if i < 306 else 'TEST')
            
            feat = {
                'temperature': round(temp, 1),
                'feelsLike': round(temp + 5.0, 1),
                'humidity': int(max(30, min(100, hum))),
                'pressure': round(pres, 1),
                'windSpeed': round(max(0, wind), 1),
                'windDirection': int(np.random.uniform(120, 240)),
                'windGust': round(max(0, wind * 1.4), 1),
                'rainfallRate': round(rain, 1),
                'cloudCover': 95 if is_storm else int(np.random.uniform(20, 80)),
                'tempDelta30m': -1.8 if is_storm else round(np.random.normal(0, 0.4), 1),
                'pressureDelta30m': round(pres_drop, 1),
                'humidityDelta30m': 8 if is_storm else int(np.random.normal(0, 3)),
                'windSpeedDelta30m': 14.0 if is_gale_gust else round(np.random.normal(0, 2.0), 1),
                'pressureTendencyHpaPerHr': round(pres_drop * 1.5, 1),
                'rollingRainAccum30m': round(rain * 0.5, 1),
                'rollingRainAccum60m': round(rain, 1),
                'rollingMeanTemp60m': round(temp, 1),
                'rollingMaxWind60m': round(wind * 1.4, 1),
                'hourSin': round(np.sin(2 * np.pi * ts.hour / 24), 4),
                'hourCos': round(np.cos(2 * np.pi * ts.hour / 24), 4),
                'dayOfYearSin': round(np.sin(2 * np.pi * ts.dayofyear / 365.25), 4),
                'dayOfYearCos': round(np.cos(2 * np.pi * ts.dayofyear / 365.25), 4),
            }

            label = 'NONE'
            if rain >= 50.0:
                label = 'CLOUDBURST_POTENTIAL'
            elif rain >= 15.0:
                label = 'HEAVY_RAIN'
            elif wind >= 50.0 or (wind * 1.4) >= 70.0:
                label = 'GALE_WIND'
            elif rain >= 5.0 and pres_drop < -2.0:
                label = 'CONVECTIVE_SURGE'

            targs = {
                'targetRain15m': round(rain * 1.1, 1),
                'targetRain30m': round(rain * 1.2, 1),
                'targetRain60m': round(rain * 1.3, 1),
                'targetConvectiveEvent': label,
            }

            records.append({
                'id': f'feat-gen-{i}',
                'gridId': 'GRID_R01_N2861_E07720',
                'gridCode': 'GRID_R01_N2861_E07720',
                'timestamp': iso,
                'splitType': split,
                'features': feat,
                'targets': targs,
            })

        return records
