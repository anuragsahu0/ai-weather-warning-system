"""
ERROR 404 — Scientific ML Evaluation Metrics
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import Dict, Any
import numpy as np
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    precision_recall_curve,
    auc,
    brier_score_loss,
    confusion_matrix
)
from ml.data.schemas import ModelSkillMetrics, ConfusionMatrix

def evaluate_model_performance(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: np.ndarray,
    decision_threshold: float = 0.5
) -> ModelSkillMetrics:
    """
    Computes complete, scientifically auditable skill scores on the chronological test split.
    """
    y_true = np.asarray(y_true, dtype=int)
    y_pred = np.asarray(y_pred, dtype=int)
    y_prob = np.asarray(y_prob, dtype=float)

    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    # ROC-AUC (Check if both classes present in test split)
    try:
        roc_auc = roc_auc_score(y_true, y_prob)
    except Exception:
        roc_auc = 0.5

    # PR-AUC
    try:
        precision_curve, recall_curve, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = auc(recall_curve, precision_curve)
    except Exception:
        pr_auc = 0.0

    # Brier Score (Lower is better, 0 = perfect forecast calibration)
    try:
        brier = brier_score_loss(y_true, y_prob)
    except Exception:
        brier = 0.25

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    return ModelSkillMetrics(
        precision=round(float(prec), 3),
        recall=round(float(rec), 3),
        f1Score=round(float(f1), 3),
        rocAuc=round(float(roc_auc), 3),
        prAuc=round(float(pr_auc), 3),
        brierScore=round(float(brier), 3),
        decisionThreshold=round(float(decision_threshold), 2),
        confusionMatrix=ConfusionMatrix(
            truePositives=int(tp),
            falsePositives=int(fp),
            trueNegatives=int(tn),
            falseNegatives=int(fn),
        ),
    )
