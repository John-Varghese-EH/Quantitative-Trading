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
Transformer model using PyTorch for financial time series classification.
"""
import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset


class FinancialTransformer(nn.Module):
    def __init__(self, n_features: int, d_model: int = 64, nhead: int = 4,
                 num_layers: int = 2, dropout: float = 0.1):
        super().__init__()
        self.input_proj = nn.Linear(n_features, d_model)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dropout=dropout,
            dim_feedforward=d_model * 4, batch_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        # x: (batch, seq_len, features)
        x = self.input_proj(x)
        x = self.transformer(x)
        x = x.mean(dim=1)  # Global average pooling
        return self.classifier(x).squeeze(-1)


def _create_sequences(X: np.ndarray, seq_len: int = 10):
    seqs = []
    for i in range(seq_len, len(X) + 1):
        seqs.append(X[i - seq_len:i])
    return np.array(seqs)


def train(X_train, X_test, y_train, params: dict):
    seq_len = params.get("seq_len", 10)
    d_model = params.get("d_model", 64)
    nhead = params.get("nhead", 4)
    num_layers = params.get("num_layers", 2)
    epochs = params.get("epochs", 15)
    batch_size = params.get("batch_size", 32)
    lr = params.get("learning_rate", 1e-3)
    dropout = params.get("dropout", 0.1)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    X_seq = _create_sequences(X_train, seq_len)
    y_seq = y_train[seq_len - 1:]
    min_len = min(len(X_seq), len(y_seq))
    X_seq, y_seq = X_seq[:min_len], y_seq[:min_len]

    X_t = torch.FloatTensor(X_seq).to(device)
    y_t = torch.FloatTensor(y_seq).to(device)

    dataset = TensorDataset(X_t, y_t)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    n_features = X_train.shape[1]
    net = FinancialTransformer(n_features, d_model, nhead, num_layers, dropout).to(device)
    optimizer = torch.optim.Adam(net.parameters(), lr=lr)
    criterion = nn.BCELoss()

    net.train()
    for epoch in range(epochs):
        for xb, yb in loader:
            optimizer.zero_grad()
            pred = net(xb)
            loss = criterion(pred, yb)
            loss.backward()
            optimizer.step()

    # Predict on test set
    net.eval()
    X_test_seq = _create_sequences(X_test, seq_len)
    with torch.no_grad():
        X_test_t = torch.FloatTensor(X_test_seq).to(device)
        y_prob_raw = net(X_test_t).cpu().numpy()

    y_prob = y_prob_raw[:len(X_test)]
    y_pred = (y_prob >= 0.5).astype(int)

    class TransformerWrapper:
        def __init__(self, model, sl, dev):
            self.model = model
            self.seq_len = sl
            self.device = dev
            self.feature_importances_ = None

        def predict(self, X):
            return self.predict_proba(X)[:, 1] >= 0.5

        def predict_proba(self, X):
            Xs = _create_sequences(X, self.seq_len)
            with torch.no_grad():
                Xt = torch.FloatTensor(Xs).to(self.device)
                probs = self.model(Xt).cpu().numpy()[:len(X)]
            return np.column_stack([1 - probs, probs])

    return TransformerWrapper(net, seq_len, device), y_pred, y_prob
