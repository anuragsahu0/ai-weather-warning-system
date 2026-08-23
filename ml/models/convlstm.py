"""
ERROR 404 — Spatio-Temporal ConvLSTM Neural Network
AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting
"""

from typing import Tuple, Dict, Any, List, Optional
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

OptionalState = Optional[Tuple[torch.Tensor, torch.Tensor]]

class ConvLSTMCell(nn.Module):
    """
    2D Convolutional Long Short-Term Memory Cell.
    Preserves 2D spatial dimensions [B, C, H, W] while advancing temporal recurrence.
    """
    def __init__(self, input_channels: int, hidden_channels: int, kernel_size: int = 3):
        super().__init__()
        self.input_channels = input_channels
        self.hidden_channels = hidden_channels
        self.padding = kernel_size // 2

        self.conv = nn.Conv2d(
            in_channels=input_channels + hidden_channels,
            out_channels=4 * hidden_channels,
            kernel_size=kernel_size,
            padding=self.padding,
            bias=True
        )

    def forward(
        self,
        x: torch.Tensor,
        state: OptionalState = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        batch_size, _, height, width = x.size()
        device = x.device

        if state is None:
            h_cur = torch.zeros(batch_size, self.hidden_channels, height, width, device=device)
            c_cur = torch.zeros(batch_size, self.hidden_channels, height, width, device=device)
        else:
            h_cur, c_cur = state

        combined = torch.cat([x, h_cur], dim=1)
        gates = self.conv(combined)

        cc_i, cc_f, cc_o, cc_g = torch.split(gates, self.hidden_channels, dim=1)
        i = torch.sigmoid(cc_i)
        f = torch.sigmoid(cc_f)
        o = torch.sigmoid(cc_o)
        g = torch.tanh(cc_g)

        c_next = f * c_cur + i * g
        h_next = o * torch.tanh(c_next)

        return h_next, c_next

class ConvLSTMNowcaster(nn.Module):
    """
    Spatio-Temporal Deep Learning Nowcaster with Multi-Task Heads
    and Monte Carlo Dropout Uncertainty Bounds.
    """
    def __init__(
        self,
        input_channels: int = 8,
        hidden_channels: int = 32,
        num_horizons: int = 4, # +10m, +20m, +30m, +60m
        num_events: int = 3,   # Heavy Rain, Severe Convective, Gale Wind
        dropout_prob: float = 0.2
    ):
        super().__init__()
        self.input_channels = input_channels
        self.hidden_channels = hidden_channels
        self.num_horizons = num_horizons
        self.num_events = num_events
        self.dropout_prob = dropout_prob

        # 2-Layer ConvLSTM Encoder
        self.cell1 = ConvLSTMCell(input_channels, hidden_channels)
        self.cell2 = ConvLSTMCell(hidden_channels, hidden_channels * 2)

        # Spatial Feature Extraction
        self.spatial_conv = nn.Conv2d(hidden_channels * 2, hidden_channels, kernel_size=1)
        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        # Monte Carlo Dropout Layer
        self.dropout = nn.Dropout(p=dropout_prob)

        # Multi-Task Prediction Heads
        self.fc_shared = nn.Linear(hidden_channels, 64)

        # 1. Multi-Horizon Rainfall Intensity Head (mm/h)
        self.rain_head = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_horizons),
            nn.ReLU() # Rainfall rate is strictly non-negative
        )

        # 2. Multi-Horizon Wind Speed Head (km/h)
        self.wind_head = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_horizons),
            nn.ReLU() # Wind speed is non-negative
        )

        # 3. Severe Convective Event Probability Head
        self.event_head = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_events),
            nn.Sigmoid() # Calibrated probabilities [0.0 - 1.0]
        )

    def forward(
        self,
        x: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Forward pass.
        x shape: [B, T, C, H, W]
        Returns: (rain_preds, wind_preds, event_probs)
        """
        batch_size, seq_len, _, height, width = x.size()

        # Step through ConvLSTM recurrent layers
        state1 = None
        state2 = None

        for t in range(seq_len):
            xt = x[:, t, :, :, :]
            h1, c1 = self.cell1(xt, state1)
            state1 = (h1, c1)

            h2, c2 = self.cell2(h1, state2)
            state2 = (h2, c2)

        # Spatial context at final timestep
        final_h = state2[0] # [B, hidden_channels * 2, H, W]
        spatial_feats = F.relu(self.spatial_conv(final_h))
        pooled = self.pool(spatial_feats).view(batch_size, -1) # [B, hidden_channels]

        # Shared representation with MC dropout
        feat = self.dropout(F.relu(self.fc_shared(pooled)))

        # Output heads
        rain_preds = self.rain_head(feat)
        wind_preds = self.wind_head(feat)
        event_probs = self.event_head(feat)

        return rain_preds, wind_preds, event_probs

    def predict_with_uncertainty(
        self,
        x: torch.Tensor,
        num_mc_samples: int = 20
    ) -> Dict[str, Any]:
        """
        Performs Monte Carlo Dropout sampling during inference to estimate
        predictive mean, empirical variance, and 90% confidence intervals.
        """
        self.train() # Keep dropout active for MC sampling

        rain_samples = []
        wind_samples = []
        event_samples = []

        with torch.no_grad():
            for _ in range(num_mc_samples):
                r_pred, w_pred, e_pred = self.forward(x)
                rain_samples.append(r_pred.cpu().numpy())
                wind_samples.append(w_pred.cpu().numpy())
                event_samples.append(e_pred.cpu().numpy())

        self.eval() # Return to eval mode

        # Shape: [num_mc_samples, B, num_horizons]
        r_arr = np.array(rain_samples)
        w_arr = np.array(wind_samples)
        e_arr = np.array(event_samples)

        # Mean and Standard Deviation
        r_mean = np.mean(r_arr, axis=0)[0]
        r_std = np.std(r_arr, axis=0)[0]

        w_mean = np.mean(w_arr, axis=0)[0]
        w_std = np.std(w_arr, axis=0)[0]

        e_mean = np.mean(e_arr, axis=0)[0]
        e_std = np.std(e_arr, axis=0)[0]

        # 90% Confidence Interval: [mean - 1.645 * std, mean + 1.645 * std]
        r_lower = np.maximum(0.0, r_mean - 1.645 * r_std)
        r_upper = r_mean + 1.645 * r_std

        # Uncertainty score normalized to 0.0 - 1.0
        uncertainty_score = float(np.clip(np.mean(r_std) / 5.0, 0.05, 0.95))

        return {
            'rain_mean': np.round(r_mean, 2).tolist(),
            'rain_lower_90': np.round(r_lower, 2).tolist(),
            'rain_upper_90': np.round(r_upper, 2).tolist(),
            'wind_mean': np.round(w_mean, 1).tolist(),
            'event_probs': np.round(e_mean, 3).tolist(),
            'uncertainty_score': round(uncertainty_score, 2),
        }
