# ❤️ CardioDetect

### Every heartbeat leaves a clue.

**CardioDetect** is an experimental machine learning web application that uses a trained classification model to analyze user-provided health indicators and generate a heart disease prediction.

The project combines a Python-based machine learning pipeline, a FastAPI backend, and a React frontend to demonstrate an end-to-end machine learning application.

> **Medical disclaimer:** CardioDetect is an educational project. Its predictions are not medical diagnoses, and it has not been established as a clinically validated diagnostic tool. Do not use it to make medical decisions.

---

## ✨ Features

- **Machine Learning:** A trained scikit-learn classification pipeline for experimental heart disease prediction.
- **Interactive Web Interface:** A React + Vite frontend with a heart-investigation theme.
- **FastAPI Backend:** A REST API that validates input, runs the model, and returns predictions.
- **Data Preprocessing:** Integrated preprocessing through the saved pipeline, including numerical and categorical transformations where configured.
- **Prediction Results:** Displays the model's output and relevant information returned by the backend.
- **Input Validation:** Checks user inputs before sending them to the model.
- **Responsive Design:** Designed for desktop and mobile experiences.
- **API Documentation:** Interactive API documentation through FastAPI.

---

## 🧰 Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI, Uvicorn |
| Machine Learning | scikit-learn |
| Data Processing | Pandas, NumPy |
| Model Serialization | Joblib |
| API Validation | Pydantic |
| Testing | Pytest |

---

## 🏗️ Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP POST /predict
  v
FastAPI Backend
  |
  | Validate input
  v
Saved ML Pipeline
  |
  | Prediction
  v
FastAPI JSON Response
  |
  v
React Results Dashboard
```

### How it works

1. The user enters health-related information in the investigation form.
2. The frontend sends the information to the FastAPI backend.
3. The backend validates the request and passes the data to the saved ML pipeline.
4. The pipeline applies its configured preprocessing and generates a prediction.
5. The backend returns the result as JSON.
6. The frontend displays the returned result.

---

## 📂 Project Structure

```text
cardio-detect/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   └── predictor.py
│   ├── models/
│   │   └── heart_disease_pipeline.pkl
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── notebooks/
│   └── heart_disease_eda.ipynb
├── data/
│   └── README.md
├── .gitignore
├── .env.example
└── README.md
```

*The structure above is the intended layout. Actual filenames may differ depending on the implementation.*

---

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.11 or a compatible version
- Node.js and npm
- Git
- The trained model artifact: `heart_disease_pipeline.pkl`

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cardio-detect.git
cd cardio-detect
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```bash
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Add the trained model

Place the trained pipeline in:

```text
backend/models/heart_disease_pipeline.pkl
```

The backend must load the same pipeline used during training. A model artifact must be generated before predictions can work.

### 4. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### 5. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

---

## 🔌 API Reference

### GET /

Returns a welcome message and API information.

### GET /health

Checks whether the backend is running and whether the model is loaded.

Example response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

*The exact response depends on the backend implementation.*

### POST /predict

Accepts the health features required by the trained model.

Example request:

```json
{
  "Age": 45,
  "Sex": "M",
  "ChestPainType": "ATA",
  "RestingBP": 130,
  "Cholesterol": 220,
  "FastingBS": 0,
  "RestingECG": "Normal",
  "MaxHR": 150,
  "ExerciseAngina": "N",
  "Oldpeak": 1.0,
  "ST_Slope": "Up"
}
```

**Important:** This is an illustrative payload. Confirm that the feature names, categorical values, and target encoding match the actual trained model before using it.

Example response:

```json
{
  "prediction": 0,
  "label": "Model output",
  "probability": null,
  "disclaimer": "Experimental model output; not a medical diagnosis."
}
```

The actual response fields and labels depend on the model and API implementation. A model probability, if provided, is not a medically validated risk percentage.

---

## 🧪 Testing

From the backend directory:

```bash
pytest
```

Tests should cover:

- Health endpoint
- Valid prediction requests
- Invalid input handling
- Model loading failures

---

## 🔒 Privacy and Security

- Do not commit secrets, environment files, or private user data.
- Keep the model and prediction logic on the backend.
- Configure CORS for trusted frontend origins.
- Avoid storing or logging identifiable health information.
- Use HTTPS and appropriate security controls before any public deployment.

---

## ⚠️ Limitations

- The model's output depends on the training dataset and preprocessing.
- Performance on a test dataset does not establish clinical validity.
- Predictions may be inaccurate for individuals or populations not represented in training data.
- Model probabilities, if available, may not be calibrated.
- The application is intended for learning and demonstration, not diagnosis or treatment.

If you have health concerns, consult a qualified healthcare professional.

---

## 🚀 Future Improvements

- Deploy the frontend and backend.
- Add automated model evaluation and monitoring.
- Improve input validation and API security.
- Add model versioning and reproducible training.
- Add a database only if prediction history is needed and appropriate privacy safeguards are implemented.
- Improve accessibility and responsive design.

---

## 👨‍💻 Author

**Jasmanjot Singh Sarna**

B.Tech Computer Science Engineering — AI & ML

- [LinkedIn](https://www.linkedin.com/in/jasmanjot-singh-sarna-0a2539286/)
- [Portfolio](https://jasmanjot-portfolio.vercel.app/)

---

## 📄 License

Choose and add a license before distributing or reusing this project.

---

**CardioDetect — Every heartbeat leaves a clue.**