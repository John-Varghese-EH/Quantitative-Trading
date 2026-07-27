# QuantAdv - Quantitative Trading Platform
# Copyright (C) 2026 John Varghese (J0X)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""
All 6 adversarial attack implementations.
Each attack takes a model, input features X, and parameters.
Returns perturbed inputs and metadata.
"""

import numpy as np


# ─── FGSM — Fast Gradient Sign Method ────────────────────────────────────────
def fgsm_attack(model, X: np.ndarray, epsilon: float = 0.01) -> tuple[np.ndarray, dict]:
    """
    FGSM: perturb inputs in the direction of the gradient sign.
    Approximated for black-box models using finite differences.
    """
    X_adv = X.copy().astype(float)
    for j in range(X.shape[1]):
        x_plus = X_adv.copy()
        x_plus[:, j] += 1e-4
        x_minus = X_adv.copy()
        x_minus[:, j] -= 1e-4
        
        p_plus = model.predict_proba(x_plus)[:, 1]
        p_minus = model.predict_proba(x_minus)[:, 1]
        grad_approx = (p_plus - p_minus) / (2e-4)
        
        X_adv[:, j] += epsilon * np.sign(grad_approx)

    return X_adv, {"attack": "FGSM", "epsilon": epsilon}


# ─── PGD — Projected Gradient Descent ────────────────────────────────────────
def pgd_attack(model, X: np.ndarray, epsilon: float = 0.05,
               alpha: float = 0.01, num_steps: int = 10) -> tuple[np.ndarray, dict]:
    """
    PGD: iterative FGSM with projection back into epsilon-ball.
    """
    X_adv = X.copy().astype(float)
    X_orig = X.copy()
    
    for _ in range(num_steps):
        for j in range(X.shape[1]):
            x_plus = X_adv.copy()
            x_plus[:, j] += 1e-4
            x_minus = X_adv.copy()
            x_minus[:, j] -= 1e-4
            grad = (model.predict_proba(x_plus)[:, 1] - model.predict_proba(x_minus)[:, 1]) / 2e-4
            X_adv[:, j] += alpha * np.sign(grad)
        
        # Project back to epsilon-ball
        perturbation = np.clip(X_adv - X_orig, -epsilon, epsilon)
        X_adv = X_orig + perturbation

    return X_adv, {"attack": "PGD", "epsilon": epsilon, "steps": num_steps}


# ─── Data Poisoning ──────────────────────────────────────────────────────────
def data_poisoning_attack(X: np.ndarray, y: np.ndarray, poison_rate: float = 0.1) -> tuple[np.ndarray, np.ndarray, dict]:
    """
    Inject poisoned samples into training data.
    Perturbs random samples and optionally flips their labels.
    """
    n_poison = max(1, int(len(X) * poison_rate))
    indices = np.random.choice(len(X), n_poison, replace=False)
    
    X_poisoned = X.copy()
    y_poisoned = y.copy()
    
    # Perturb features significantly
    X_poisoned[indices] += np.random.normal(0, 0.5, X_poisoned[indices].shape)
    # Flip labels of poisoned samples
    y_poisoned[indices] = 1 - y_poisoned[indices]
    
    return X_poisoned, y_poisoned, {"attack": "DataPoisoning", "n_poisoned": n_poison, "poison_rate": poison_rate}


# ─── Label Flipping ──────────────────────────────────────────────────────────
def label_flipping_attack(y: np.ndarray, flip_rate: float = 0.15) -> tuple[np.ndarray, dict]:
    """Randomly flip training labels to corrupt the model."""
    n_flip = max(1, int(len(y) * flip_rate))
    indices = np.random.choice(len(y), n_flip, replace=False)
    y_flipped = y.copy()
    y_flipped[indices] = 1 - y_flipped[indices]
    return y_flipped, {"attack": "LabelFlipping", "n_flipped": n_flip, "flip_rate": flip_rate}


# ─── Feature Manipulation ────────────────────────────────────────────────────
def feature_manipulation_attack(X: np.ndarray, target_feature_idx: list = None,
                                  manipulation_factor: float = 2.0) -> tuple[np.ndarray, dict]:
    """Scale specific features to manipulate model behavior."""
    X_manip = X.copy()
    if target_feature_idx is None:
        # Target top 3 most variable features
        variances = X.var(axis=0)
        target_feature_idx = np.argsort(variances)[-3:].tolist()
    
    X_manip[:, target_feature_idx] *= manipulation_factor
    return X_manip, {
        "attack": "FeatureManipulation",
        "target_features": target_feature_idx,
        "factor": manipulation_factor,
    }


# ─── Noise Injection ─────────────────────────────────────────────────────────
def noise_injection_attack(X: np.ndarray, noise_type: str = "gaussian",
                            noise_scale: float = 0.1) -> tuple[np.ndarray, dict]:
    """Inject random noise into input features."""
    X_noisy = X.copy().astype(float)
    if noise_type == "gaussian":
        noise = np.random.normal(0, noise_scale, X.shape)
    elif noise_type == "uniform":
        noise = np.random.uniform(-noise_scale, noise_scale, X.shape)
    elif noise_type == "salt_pepper":
        noise = np.zeros_like(X, dtype=float)
        mask = np.random.random(X.shape) < noise_scale
        noise[mask] = np.random.choice([-1, 1], size=mask.sum()) * X.std(axis=0).mean()
    else:
        noise = np.random.normal(0, noise_scale, X.shape)
    
    X_noisy += noise
    return X_noisy, {"attack": "NoiseInjection", "noise_type": noise_type, "scale": noise_scale}


# ─── Carlini & Wagner (C&W) ──────────────────────────────────────────────────
def cw_attack(model, X: np.ndarray, c: float = 1e-4, kappa: float = 0, steps: int = 10, lr: float = 0.01) -> tuple[np.ndarray, dict]:
    """
    Approximation of C&W L2 attack for black-box/tabular models.
    Minimizes L2 distance while pushing the model towards incorrect classification.
    """
    import torch
    import torch.optim as optim
    
    # We'll do a basic gradient-free approximation or tensor-based if model is PyTorch
    # Since we must support scikit-learn natively in this file, we use an iterative approach
    X_adv = X.copy().astype(float)
    X_orig = X.copy().astype(float)
    
    for _ in range(steps):
        for j in range(X.shape[1]):
            x_plus = X_adv.copy()
            x_plus[:, j] += 1e-4
            x_minus = X_adv.copy()
            x_minus[:, j] -= 1e-4
            
            p_plus = model.predict_proba(x_plus)[:, 1]
            p_minus = model.predict_proba(x_minus)[:, 1]
            grad = (p_plus - p_minus) / 2e-4
            
            # Update with L2 penalty
            l2_grad = 2 * c * (X_adv[:, j] - X_orig[:, j])
            X_adv[:, j] -= lr * (grad + l2_grad)
            
    return X_adv, {"attack": "C&W", "c": c, "steps": steps}


# ─── Targeted Slope-Based Attacks (GSA & LSSA) ───────────────────────────────
def slope_attack(X: np.ndarray, attack_type: str = "GSA", slope_factor: float = 0.05) -> tuple[np.ndarray, dict]:
    """
    General Slope Attack (GSA) and Least-Squares Slope Attack (LSSA).
    Manipulates the overall trend (slope) of the financial time-series window.
    """
    X_adv = X.copy().astype(float)
    seq_len = X.shape[1]
    
    if attack_type == "GSA":
        # Simply tilt the window linearly
        tilt = np.linspace(-slope_factor, slope_factor, seq_len)
        X_adv += tilt
    elif attack_type == "LSSA":
        # More subtle tilt maintaining the mean
        mean_val = np.mean(X_adv, axis=1, keepdims=True)
        tilt = np.linspace(-slope_factor, slope_factor, seq_len)
        X_adv = mean_val + (X_adv - mean_val) * (1 + tilt)
        
    return X_adv, {"attack": attack_type, "slope_factor": slope_factor}


# ─── Adversarial GAN (A-GAN) ─────────────────────────────────────────────────
def agan_attack(X: np.ndarray, noise_dim: int = 10) -> tuple[np.ndarray, dict]:
    """
    Synthesize highly realistic but malicious market data.
    (Stubbed for inference using pre-trained weights if available, otherwise generates smart noise).
    """
    X_adv = X.copy().astype(float)
    # Simulate GAN output by mixing moving averages with random noise
    noise = np.random.normal(0, 0.02, X.shape)
    X_adv = X_adv * 0.9 + np.roll(X_adv, 1, axis=1) * 0.1 + noise
    return X_adv, {"attack": "A-GAN", "noise_dim": noise_dim}
