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

"""Linear Regression model for binary classification via threshold."""
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression


def train(X_train, X_test, y_train, params: dict):
    C = params.get("C", 1.0)
    max_iter = params.get("max_iter", 1000)
    
    base = LogisticRegression(C=C, max_iter=max_iter, random_state=42, n_jobs=-1)
    model = CalibratedClassifierCV(base, cv=3)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    return model, y_pred, y_prob
