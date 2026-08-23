"""
ERROR 404 — Python ML Pydantic Schemas
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field

PredictionTask = Literal['HEAVY_RAIN', 'SEVERE_CONVECTIVE', 'GALE_WIND']
AlgorithmType = Literal['LogisticRegression', 'RandomForestClassifier', 'GradientBoostingClassifier']
SeverityLevel = Literal['LOW', 'MODERATE', 'HIGH', 'SEVERE']
ModelStatus = Literal['MODEL_READY', 'MODEL_UNAVAILABLE', 'INSUFFICIENT_DATA', 'STALE_INPUT_DATA', 'INFERENCE_ERROR']

class FeatureInput(BaseModel):
    temperature: Optional[float] = None
    feelsLike: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    windSpeed: Optional[float] = None
    windDirection: Optional[float] = None
    windGust: Optional[float] = None
    rainfallRate: Optional[float] = None
    cloudCover: Optional[float] = None
    tempDelta30m: Optional[float] = None
    pressureDelta30m: Optional[float] = None
    humidityDelta30m: Optional[float] = None
    windSpeedDelta30m: Optional[float] = None
    pressureTendencyHpaPerHr: Optional[float] = None
    rollingRainAccum30m: Optional[float] = None
    rollingRainAccum60m: Optional[float] = None
    rollingMeanTemp60m: Optional[float] = None
    rollingMaxWind60m: Optional[float] = None
    hourSin: float = 0.0
    hourCos: float = 1.0
    dayOfYearSin: float = 0.0
    dayOfYearCos: float = 1.0

class PredictRequest(BaseModel):
    gridId: str
    gridCode: str
    task: PredictionTask = 'HEAVY_RAIN'
    horizonMinutes: int = 30
    features: FeatureInput
    featureTimestamp: str
    dataFreshnessSeconds: int = 0

class PredictiveFeatureContribution(BaseModel):
    featureName: str
    featureValue: Optional[Union[float, str]] = None
    relativeContribution: float
    direction: Literal['INCREASES_RISK', 'DECREASES_RISK', 'NEUTRAL']

class PredictResponse(BaseModel):
    id: str
    gridId: str
    gridCode: str
    task: PredictionTask
    horizonMinutes: int
    prediction: bool
    probability: float
    decisionThreshold: float
    severityLevel: SeverityLevel
    modelVersion: str
    algorithm: str
    generatedAt: str
    featureTimestamp: str
    dataFreshnessSeconds: int
    status: ModelStatus
    topFeatures: List[PredictiveFeatureContribution]
    explanationSummary: str

class ConfusionMatrix(BaseModel):
    truePositives: int
    falsePositives: int
    trueNegatives: int
    falseNegatives: int

class ModelSkillMetrics(BaseModel):
    precision: float = 0.0
    recall: float = 0.0
    f1Score: float = 0.0
    rocAuc: Optional[float] = 0.5
    prAuc: Optional[float] = 0.0
    brierScore: float = 0.0
    decisionThreshold: float = 0.5
    confusionMatrix: ConfusionMatrix

class ModelCard(BaseModel):
    modelId: str
    modelVersion: str
    task: PredictionTask
    horizonMinutes: int
    algorithm: AlgorithmType
    datasetVersion: str
    trainingSamplesCount: int
    validationSamplesCount: int
    testSamplesCount: int
    trainingPeriod: Dict[str, str]
    testPeriod: Dict[str, str]
    metrics: ModelSkillMetrics
    featureNames: List[str]
    createdAt: str
    status: Literal['ACTIVE', 'ARCHIVED', 'CANDIDATE'] = 'ACTIVE'

class ModelStatusResponse(BaseModel):
    status: str
    loadedModelsCount: int
    availableTasks: List[str]
    models: List[Dict[str, Any]]
    lastInferenceAt: Optional[str] = None
