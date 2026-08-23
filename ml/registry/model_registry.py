"""
ERROR 404 — Model Registry & Artifact Store
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import joblib

from ml.data.schemas import ModelCard, PredictionTask
from ml.models.base import BaseWeatherModel
from ml.preprocessing.pipeline import FeaturePreprocessor

class ModelRegistry:
    def __init__(self, registry_root: Optional[Path] = None):
        if registry_root is None:
            self.registry_root = Path(os.getcwd()) / 'ml' / 'registry' / 'artifacts'
        else:
            self.registry_root = Path(registry_root)
        
        self.registry_root.mkdir(parents=True, exist_ok=True)
        self.loaded_models: Dict[str, Tuple[BaseWeatherModel, FeaturePreprocessor, ModelCard]] = {}

    def save_model(
        self,
        model: BaseWeatherModel,
        preprocessor: FeaturePreprocessor,
        card: ModelCard
    ) -> Path:
        model_dir = self.registry_root / card.modelVersion
        model_dir.mkdir(parents=True, exist_ok=True)

        artifact_path = model_dir / 'model.joblib'
        prep_path = model_dir / 'preprocessor.joblib'
        card_path = model_dir / 'model_card.json'

        joblib.dump(model, artifact_path)
        joblib.dump(preprocessor, prep_path)

        with open(card_path, 'w', encoding='utf-8') as f:
            f.write(card.model_dump_json(indent=2))

        # Cache in memory
        self.loaded_models[f"{card.task}_{card.horizonMinutes}"] = (model, preprocessor, card)
        return model_dir

    def load_model(
        self,
        task: PredictionTask,
        horizon_minutes: int = 30
    ) -> Optional[Tuple[BaseWeatherModel, FeaturePreprocessor, ModelCard]]:
        key = f"{task}_{horizon_minutes}"
        if key in self.loaded_models:
            return self.loaded_models[key]

        # Search disk for latest active model for this task & horizon
        for model_dir in self.registry_root.iterdir():
            if not model_dir.is_dir():
                continue
            card_path = model_dir / 'model_card.json'
            if card_path.exists():
                try:
                    with open(card_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    card = ModelCard(**data)
                    if card.task == task and card.horizonMinutes == horizon_minutes and card.status == 'ACTIVE':
                        model = joblib.load(model_dir / 'model.joblib')
                        preprocessor = joblib.load(model_dir / 'preprocessor.joblib')
                        self.loaded_models[key] = (model, preprocessor, card)
                        return self.loaded_models[key]
                except Exception as e:
                    print(f"Warning: Could not load model from {model_dir}: {e}")

        return None

    def list_models(self) -> List[ModelCard]:
        cards = []
        for model_dir in self.registry_root.iterdir():
            if not model_dir.is_dir():
                continue
            card_path = model_dir / 'model_card.json'
            if card_path.exists():
                try:
                    with open(card_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    cards.append(ModelCard(**data))
                except Exception:
                    pass
        return cards

model_registry = ModelRegistry()
