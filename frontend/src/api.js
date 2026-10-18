/**
 * CardioDetect API Service Layer
 * Connects to FastAPI Backend running Scikit-Learn Pipeline
 */

// In production on Vercel, default to same-origin relative path '' so /api/... routes work out of the box
// In development, fall back to localhost:8000 unless overridden by VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Fetch backend health status and model verification
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/health unavailable:', err.message);
    return {
      status: 'offline',
      engine: 'FastAPI Offline',
      model_loaded: false,
      algorithm: 'K-Nearest Neighbors (k=5)',
      accuracy: '86.41%',
      roc_auc: '92.69%'
    };
  }
}

/**
 * Fetch genuine model evaluation metrics & confusion matrix
 */
export async function fetchMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!res.ok) throw new Error(`Metrics failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/metrics unavailable, using cached authentic metrics:', err.message);
    return {
      model_name: 'K-Nearest Neighbors Classifier',
      neighbors: 5,
      dataset_size: 918,
      train_samples: 734,
      test_samples: 184,
      accuracy: 0.8641,
      precision: 0.8812,
      recall: 0.8725,
      f1_score: 0.8768,
      roc_auc: 0.9269,
      confusion_matrix: {
        true_negative: 70,
        false_positive: 12,
        false_negative: 13,
        true_positive: 89
      },
      preprocessing: [
        'Median Imputation for numerical zeros (RestingBP, Cholesterol)',
        'StandardScaler normalization on 6 numerical features',
        'One-Hot Encoding on 5 categorical features (handle_unknown="ignore")',
        'Stratified 80/20 Train-Test split'
      ]
    };
  }
}

/**
 * Fetch genuine ROC Curve data points
 */
export async function fetchRocCurve() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/roc-curve`);
    if (!res.ok) throw new Error(`ROC Curve failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/roc-curve unavailable, using cached test set ROC curve:', err.message);
    return {
      auc: 0.9269,
      algorithm: 'K-Nearest Neighbors (k=5)',
      points: [
        { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
        { fpr: 0.037, tpr: 0.471, baseline: 0.037 },
        { fpr: 0.085, tpr: 0.765, baseline: 0.085 },
        { fpr: 0.146, tpr: 0.873, baseline: 0.146 },
        { fpr: 0.244, tpr: 0.961, baseline: 0.244 },
        { fpr: 0.427, tpr: 0.990, baseline: 0.427 },
        { fpr: 1.0, tpr: 1.0, baseline: 1.0 }
      ]
    };
  }
}

/**
 * Fetch additive dataset statistics for real exploratory analytics from heart.csv
 */
export async function fetchDatasetStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dataset-stats`);
    if (!res.ok) throw new Error(`Dataset stats failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/dataset-stats unavailable:', err.message);
    return null;
  }
}

/**
 * Fetch clinical investigation presets
 */
export async function fetchPresets() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/presets`);
    if (!res.ok) throw new Error(`Presets failed with status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend /api/presets unavailable, using fallback presets:', err.message);
    return {
      healthy: {
        name: 'Healthy Baseline (Athletic / Normal)',
        data: {
          Age: 28,
          Sex: 'F',
          ChestPainType: 'ATA',
          RestingBP: 115,
          Cholesterol: 180,
          FastingBS: 0,
          RestingECG: 'Normal',
          MaxHR: 178,
          ExerciseAngina: 'N',
          Oldpeak: 0.0,
          ST_Slope: 'Up'
        }
      },
      moderate: {
        name: 'Moderate Risk (Stage 1 HTN / Elevated Vitals)',
        data: {
          Age: 54,
          Sex: 'M',
          ChestPainType: 'NAP',
          RestingBP: 138,
          Cholesterol: 245,
          FastingBS: 0,
          RestingECG: 'Normal',
          MaxHR: 142,
          ExerciseAngina: 'N',
          Oldpeak: 1.2,
          ST_Slope: 'Flat'
        }
      },
      highRisk: {
        name: 'High Risk (Clinical Watchlist / Ischemia)',
        data: {
          Age: 64,
          Sex: 'M',
          ChestPainType: 'ASY',
          RestingBP: 160,
          Cholesterol: 288,
          FastingBS: 1,
          RestingECG: 'ST',
          MaxHR: 115,
          ExerciseAngina: 'Y',
          Oldpeak: 2.8,
          ST_Slope: 'Flat'
        }
      }
    };
  }
}

/**
 * Run real ML prediction on patient vitals
 */
export async function predictRisk(vitals) {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vitals)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed with status: ${res.status}`);
  }

  return await res.json();
}
