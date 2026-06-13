import pandas as pd
import numpy as np
from fairlearn.postprocessing import ThresholdOptimizer
from sklearn.ensemble import RandomForestClassifier

X_train = pd.DataFrame({'age': [20, 30, 40, 50]})
y_train = pd.Series([1, 1, 0, 0])
# Sensitive feature where one group has ONLY negatives!
sa_train = pd.Series(['Male', 'Male', 'Female', 'Female'])

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

try:
    optimizer = ThresholdOptimizer(
        estimator=model,
        constraints="demographic_parity",
        predict_method="predict_proba",
        prefit=True
    )
    optimizer.fit(X_train, y_train, sensitive_features=sa_train)
    print("Success")
except Exception as e:
    print(f"FAILED: {repr(e)}")
