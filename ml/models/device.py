"""
ERROR 404 — Hardware Device Detection (MPS / CUDA / CPU)
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

import torch

def get_optimal_device() -> torch.device:
    """
    Automatically detects and selects the fastest available hardware accelerator:
    1. Apple Silicon GPU (MPS)
    2. NVIDIA GPU (CUDA)
    3. CPU (Universal fallback)
    """
    if torch.backends.mps.is_available() and torch.backends.mps.is_built():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    else:
        return torch.device("cpu")

def get_device_name(device: torch.device) -> str:
    if device.type == "mps":
        return "Apple Silicon GPU (Metal Performance Shaders - MPS)"
    elif device.type == "cuda":
        return f"NVIDIA GPU (CUDA: {torch.cuda.get_device_name(0)})"
    else:
        return "Universal CPU"
