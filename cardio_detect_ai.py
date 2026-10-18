
# ============================================
# CARDIO_DETECT_AI - ML PIPELINE & MODEL
# ============================================

import pandas as pd
import numpy as np
import joblib
import warnings

warnings.filterwarnings("ignore")

# --------------------------------------------
# 1. IMPORT LIBRARIES
# --------------------------------------------

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.neighbors import KNeighborsClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    RocCurveDisplay
)

import matplotlib.pyplot as plt


# --------------------------------------------
# 2. LOAD DATASET
# --------------------------------------------

df = pd.read_csv("heart.csv")

print("Dataset Shape:", df.shape)
print("\nFirst 5 Rows:")
print(df.head())

print("\nMissing Values:")
print(df.isnull().sum())


# --------------------------------------------
# 3. DATA CLEANING
# --------------------------------------------

# Treat zero values in these columns as missing.
# This is based on the assumption that zero means
# missing measurement in this dataset.

df["RestingBP"] = df["RestingBP"].replace(0, np.nan)
df["Cholesterol"] = df["Cholesterol"].replace(0, np.nan)

# Separate features and target

X = df.drop("HeartDisease", axis=1)
y = df["HeartDisease"]

print("\nTarget Distribution:")
print(y.value_counts())


# --------------------------------------------
# 4. DEFINE COLUMN TYPES
# --------------------------------------------

numerical_cols = [
    "Age",
    "RestingBP",
    "Cholesterol",
    "FastingBS",
    "MaxHR",
    "Oldpeak"
]

categorical_cols = [
    "Sex",
    "ChestPainType",
    "RestingECG",
    "ExerciseAngina",
    "ST_Slope"
]


# --------------------------------------------
# 5. NUMERICAL PREPROCESSING PIPELINE
# --------------------------------------------

numerical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),
    (
        "scaler",
        StandardScaler()
    )
])


# --------------------------------------------
# 6. CATEGORICAL PREPROCESSING PIPELINE
# --------------------------------------------

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="most_frequent")
    ),
    (
        "encoder",
        OneHotEncoder(handle_unknown="ignore")
    )
])


# --------------------------------------------
# 7. COLUMN TRANSFORMER
# --------------------------------------------

preprocessor = ColumnTransformer([
    (
        "numerical",
        numerical_pipeline,
        numerical_cols
    ),
    (
        "categorical",
        categorical_pipeline,
        categorical_cols
    )
])


# --------------------------------------------
# 8. TRAIN-TEST SPLIT
# --------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("\nTraining Samples:", X_train.shape[0])
print("Testing Samples:", X_test.shape[0])


# --------------------------------------------
# 9. COMPLETE MACHINE LEARNING PIPELINE
# --------------------------------------------

model = Pipeline([
    (
        "preprocessor",
        preprocessor
    ),
    (
        "classifier",
        KNeighborsClassifier(n_neighbors=5)
    )
])


# --------------------------------------------
# 10. TRAIN MODEL
# --------------------------------------------

print("\nTraining KNN Model...")

model.fit(X_train, y_train)

print("Model Training Completed!")


# --------------------------------------------
# 11. MAKE PREDICTIONS
# --------------------------------------------

y_pred = model.predict(X_test)

# Probability of class 1: Heart Disease

y_prob = model.predict_proba(X_test)[:, 1]


# --------------------------------------------
# 12. MODEL EVALUATION
# --------------------------------------------

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test, y_pred, zero_division=0
)

recall = recall_score(
    y_test, y_pred, zero_division=0
)

f1 = f1_score(
    y_test, y_pred, zero_division=0
)

roc_auc = roc_auc_score(y_test, y_prob)


print("\n===================================")
print("       MODEL EVALUATION")
print("===================================")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")


# --------------------------------------------
# 13. CLASSIFICATION REPORT
# --------------------------------------------

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# --------------------------------------------
# 14. CONFUSION MATRIX
# --------------------------------------------

cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)

ConfusionMatrixDisplay.from_predictions(
    y_test,
    y_pred,
    cmap="Blues"
)

plt.title("Heart Disease - Confusion Matrix")
plt.tight_layout()
plt.show()


# --------------------------------------------
# 15. ROC CURVE
# --------------------------------------------

RocCurveDisplay.from_predictions(
    y_test,
    y_prob,
    name=f"KNN (AUC = {roc_auc:.3f})"
)

plt.plot(
    [0, 1],
    [0, 1],
    linestyle="--",
    color="gray"
)

plt.title("ROC Curve - Heart Disease Prediction")
plt.tight_layout()
plt.show()


# --------------------------------------------
# 16. SAVE COMPLETE PIPELINE
# --------------------------------------------

joblib.dump(
    model,
    "heart_disease_pipeline.pkl"
)

print("\nModel saved successfully!")
print("File: heart_disease_pipeline.pkl")


# --------------------------------------------
# 17. TEST WITH A SAMPLE INPUT
# --------------------------------------------

sample = X_test.iloc[[0]]

sample_prediction = model.predict(sample)[0]

sample_probability = model.predict_proba(sample)[0][1]

print("\nSample Prediction:", sample_prediction)
print(
    "Estimated Probability of Class 1:",
    round(sample_probability, 4)
)

print("\nProject Completed Successfully!")
