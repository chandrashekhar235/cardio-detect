# 🫀 CardioDetect — Clinical Intelligence & Cardiovascular Research Console

### *Every heartbeat leaves a clue.*

**CardioDetect** is a medical-technology web platform designed to explore cardiovascular disease risk classification through radical algorithmic interpretability. Built on a reproducible Scikit-Learn K-Nearest Neighbors pipeline (`k=5`), FastAPI backend, and an interactive React 19 / Vite 8 frontend.

> **Institutional Medical Notice:** CardioDetect is an experimental cardiovascular health research and educational platform exploring machine-learning-assisted classification using clinical indicators. Predictions are generated via a 5-Nearest Neighbors estimator trained on historical cohorts (918 cases). This tool is strictly non-diagnostic and does not replace professional clinical evaluation, coronary angiography, stress echocardiography, or physician guidance.

---

## ✨ System Architecture & Capabilities

### 🏛️ Dedicated Route Architecture (React Router + AnimatePresence)
- **`/` Home (Product Landing):** 12-column split hero with the **Pulse Field Canvas** (flowing ECG ribbon + reactive particle grid + traveling pulse bead), live stats ticker strip, 3-step scroll story, interactive mini-demo calling real `/api/predict`, bento grid of capabilities, and institutional ethics band.
- **`/assess` Clinical Console:** Serious, high-precision clinical interface featuring an ethics consent gate, 4-phase stepper (*Intake*, *Vitals & Chemistry*, *Cardiac & Exercise*, *Case Review*), and the **Signature Patient Monitor** (real-time canvas ECG adapting sweep speed to MaxHR and wave geometry to ST Slope/Oldpeak/Angina, alongside real-time zone gauges).
- **`/report` Case Report & Sensitivity Simulator:** Verdict banner first (icon + high-contrast text, never color alone), honest KNN 5-dot consensus (strictly discrete 0/20/40/60/80/100% probabilities), **5 Similar Patient Cards** (authentic training cases with comparative biomarkers), contributing factors breakdown, **What-If Sensitivity Simulator** with debounced real-time re-inference, and dedicated print stylesheet.
- **`/insights` Model Rigor & Dataset Explorer:** Holdout test metrics with count-up animations, continuous ROC curve (`AUC = 0.9269`) with marked operating threshold, 2×2 confusion matrix with sequential fill, and interactive 4-tab **Dataset Explorer** computed live from `heart.csv` via `/api/dataset-stats` (Class Balance, Age/MaxHR Distributions, Scatter, Categorical Breakdowns, Correlation Heatmap).
- **`/science` Inside the Model:** 6-stage scikit-learn pipeline walkthrough with vertical progress rail, LaTeX formulations, and **Interactive 2D Coordinate Space Plot** (click or arrow-key query positioning, k=3/5/7 neighbor tuning).
- **`/about` Method, Dataset & Ethics:** Verified dataset provenance (918 cases from Cleveland, Hungarian, Swiss, and Long Beach centers), plain-language model mechanics, sample size and 20% discrete granularity limitations, algorithmic fairness safeguards, and formal disclaimers.
- **`*` 404 Signal Lost:** Flatline ECG display (0 BPM) that pulses into a sinus rhythm when hovering or clicking the return action.

### 🎨 Design Tokens & Aesthetics
- **Dark Mode (Default):** Deep midnight navy canvas (`#080D1A`), frosted-glass panels (`rgba(15, 23, 42, 0.7)`), 1px translucent borders (`rgba(255, 255, 255, 0.08)`), restrained cyan (`#45D9E8`), medical green (`#48D597`), and coral red (`#FF5267`) telemetry glows.
- **Light Mode:** Crisp medical canvas (`#F8FAFC`), porcelain elevated cards (`#FFFFFF`), hairline borders (`#E2E8F0`), and high-contrast charcoal typography (`#0F172A`).
- **Layout System:** Asymmetric 12-column fluid grid up to ~1440px container (`.site-container-wide`) with subtle blueprint grid lines (`.blueprint-grid-canvas`), technical margin coordinates, and monospace metadata badges.
- **Command Palette (`Ctrl+K` / `Cmd+K`):** Global modal for instant page navigation, dark/light theme switching, and quick-loading of patient presets (Healthy, Moderate, Acute Ischemia).

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **Styling & Design System** | Tailwind CSS v4, Vanilla CSS Design Tokens, Dual-Theme Engine |
| **Motion & Graphics** | Framer Motion (page transitions, staggered reveals), HTML5 Canvas (`PulseFieldCanvas`, `PatientMonitorPanel`) |
| **Visualizations** | Recharts (ROC curve, distribution bar charts, scatter plots) |
| **Icons** | Lucide React |
| **Backend API** | Python 3.12, FastAPI, Uvicorn (ASGI) |
| **Machine Learning** | Scikit-Learn (`KNeighborsClassifier(k=5)`, `Pipeline`, `ColumnTransformer`, `StandardScaler`, `OneHotEncoder`, `SimpleImputer`) |
| **Data Processing** | Pandas, NumPy |
| **Dataset Source** | Consolidated UCI Heart Disease Dataset (`heart.csv`, 918 patient records) |

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (Virtual environment `.venv` recommended)

### 1. Start the FastAPI Backend
```bash
# From project root
.\.venv\Scripts\python.exe -m uvicorn api:app --reload --host 127.0.0.1 --port 8000
```
- Health check: `http://127.0.0.1:8000/api/health`
- Dataset stats: `http://127.0.0.1:8000/api/dataset-stats`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend
```bash
# In another terminal from frontend/
cd frontend
npm install
npm run dev
```
Frontend launches at `http://localhost:5173`.

### 3. Production Build Validation & Automated Verification
```bash
cd frontend
npm run build
npx oxlint

# Run end-to-end headless browser verification & update multi-viewport screenshots:
node scripts/verify_browser.mjs
```

---

## 📡 API Endpoints

### `GET /api/health`
Returns pipeline status, model parameters, and verified holdout test metrics.

### `GET /api/dataset-stats` *(New additive endpoint)*
Computes empirical cohort statistics directly from the 918 records in `heart.csv`:
- Total records and class balance (410 healthy / 508 heart disease).
- Binned Age and MaxHR distributions split by diagnosis.
- Categorical breakdowns for `ChestPainType` and `ST_Slope`.
- 120-point representative patient scatter sample.
- Pairwise Pearson correlation matrix across continuous physiological markers.

### `GET /api/metrics`
Returns holdout test accuracy (86.41%), ROC-AUC (0.9269), precision (88.12%), sensitivity (87.25%), and confusion matrix counts.

### `GET /api/roc-curve`
Returns authentic true positive and false positive rate coordinates from holdout evaluation.

### `POST /api/predict`
Accepts 11 standardized clinical biomarkers:
```json
{
  "Age": 54,
  "Sex": "M",
  "ChestPainType": "ASY",
  "RestingBP": 130,
  "Cholesterol": 240,
  "FastingBS": 0,
  "RestingECG": "Normal",
  "MaxHR": 145,
  "ExerciseAngina": "N",
  "Oldpeak": 1.0,
  "ST_Slope": "Flat"
}
```
Returns classification outcome, probability percentage, clinical description, contributing physiological indicators, recommended actions, and the **5 genuine nearest neighbors** from the training registry (`nearest_neighbors` with rank, Euclidean distance, diagnosis, and comparative biomarkers).

---

## 📄 License & Attribution
CardioDetect is developed by Jasmanjot Singh Sarna for cardiovascular health research and machine learning interpretability education.
Dataset provided by the UCI Machine Learning Repository (Cleveland, Hungarian, Swiss, and Long Beach V.A. cardiology registries).
# cardio-detect
