"""
ERROR 404 — Training CLI Utility
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import argparse
import sys
from ml.training.trainer import trainer

def main():
    parser = argparse.ArgumentParser(description="ERROR 404 Baseline Model Training CLI")
    parser.add_argument("--task", type=str, default="HEAVY_RAIN", choices=["HEAVY_RAIN", "SEVERE_CONVECTIVE", "GALE_WIND"])
    parser.add_argument("--horizon", type=int, default=30, choices=[10, 20, 30, 60])
    parser.add_argument("--all", action="store_true", help="Train all baseline tasks across horizons")

    args = parser.parse_args()

    if args.all:
        print("================================================================")
        print("   ERROR 404 — Training All Baseline Meteorological Models")
        print("================================================================")
        
        tasks = ["HEAVY_RAIN", "SEVERE_CONVECTIVE", "GALE_WIND"]
        horizons = [30, 60]

        for t in tasks:
            for h in horizons:
                trainer.train_and_evaluate(task=t, horizon=h)
        print("\nAll baseline models trained, evaluated on test split, and registered successfully.")
    else:
        trainer.train_and_evaluate(task=args.task, horizon=args.horizon)

if __name__ == "__main__":
    main()
