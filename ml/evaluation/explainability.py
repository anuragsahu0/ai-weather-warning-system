"""
ERROR 404 — Model Explainability & Feature Contribution
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from ml.data.schemas import PredictiveFeatureContribution

def explain_prediction(
    feature_dict: Dict[str, Any],
    feature_importance_map: Dict[str, float],
    probability: float
) -> Tuple[List[PredictiveFeatureContribution], str]:
    """
    Computes top predictive factor contributions for a given prediction without claiming unverified causal relations.
    """
    contributions = []

    # Priority features for meteorological risk
    priority_keys = [
        'pressureTendencyHpaPerHr',
        'rollingRainAccum60m',
        'rainfallRate',
        'windGust',
        'humidity',
        'tempDelta30m',
        'pressureDelta30m',
        'windSpeed',
        'temperature',
    ]

    for key in priority_keys:
        val = feature_dict.get(key)
        if val is None:
            continue

        weight = feature_importance_map.get(key, 0.05)
        direction = 'NEUTRAL'

        if key == 'pressureTendencyHpaPerHr' and isinstance(val, (int, float)) and val < -1.5:
            direction = 'INCREASES_RISK'
            weight *= 1.8
        elif key in ('rollingRainAccum60m', 'rainfallRate') and isinstance(val, (int, float)) and val > 10.0:
            direction = 'INCREASES_RISK'
            weight *= 1.5
        elif key == 'windGust' and isinstance(val, (int, float)) and val > 40.0:
            direction = 'INCREASES_RISK'
            weight *= 1.4
        elif key == 'humidity' and isinstance(val, (int, float)) and val > 80.0:
            direction = 'INCREASES_RISK'
        elif key == 'tempDelta30m' and isinstance(val, (int, float)) and val < -1.0:
            direction = 'INCREASES_RISK'
        else:
            direction = 'DECREASES_RISK' if probability < 0.3 else 'NEUTRAL'

        contributions.append({
            'name': key,
            'val': val,
            'importance': weight,
            'direction': direction
        })

    # Sort by importance
    contributions.sort(key=lambda x: x['importance'], reverse=True)
    top_5 = contributions[:5]

    # Normalize relative scores to 0-1
    max_imp = max([c['importance'] for c in top_5]) if top_5 else 1.0
    result_list = [
        PredictiveFeatureContribution(
            featureName=c['name'],
            featureValue=c['val'],
            relativeContribution=round(float(c['importance'] / max_imp), 2),
            direction=c['direction']
        )
        for c in top_5
    ]

    # Human-readable summary
    top_names = [c['name'] for c in top_5 if c['direction'] == 'INCREASES_RISK']
    if top_names:
        summary = f"Elevated predictive contribution observed from {', '.join(top_names[:3])}."
    else:
        summary = "Surface atmospheric parameters within stable, non-severe baseline bounds."

    return result_list, summary
