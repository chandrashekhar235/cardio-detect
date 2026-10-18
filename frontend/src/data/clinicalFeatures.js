/**
 * Clinical Feature Definitions, Units, Guidance, and Reference Ranges
 * Formulated for clear patient/student understanding and verified against the UCI Heart Disease Dataset.
 */

export const CLINICAL_FEATURES = {
  Age: {
    id: 'Age',
    name: 'Age',
    unit: 'Years',
    whatItIs: 'Your current chronological age in completed years.',
    whatToEnter: 'Enter your age between 18 and 100.',
    whereToFind: 'Your standard personal identification or patient demographic record.',
    normalRange: '18 – 45 years: Lower baseline demographic vascular risk.',
    concerningRange: '≥ 50 years (males) or ≥ 55 years (females): Natural increase in vascular stiffness and arterial plaque vulnerability.',
    whyModelUsesIt: 'Age is an established cardiovascular risk factor. The model matches patients with peers in similar life stages to evaluate age-adjusted cardiac function.',
    type: 'numeric',
    min: 18,
    max: 100,
    step: 1,
    default: 54
  },

  Sex: {
    id: 'Sex',
    name: 'Biological Sex',
    unit: 'Category',
    whatItIs: 'Biological sex assigned at clinical recording.',
    whatToEnter: 'Select Male (M) or Female (F).',
    whereToFind: 'Demographic header on your hospital chart or lab report.',
    normalRange: 'Categorical parameter reflecting biological vascular traits.',
    concerningRange: 'Males historically exhibit earlier macrovascular coronary disease; females present distinct microvascular patterns and elevated post-menopausal onset.',
    whyModelUsesIt: 'Sex hormones and arterial caliber influence ischemia symptom expression and baseline coronary disease prevalence.',
    type: 'categorical',
    options: [
      { key: 'M', label: 'Male (M)', desc: 'Higher baseline incidence of obstructive coronary disease in midlife.' },
      { key: 'F', label: 'Female (F)', desc: 'Higher microvascular angina patterns; elevated post-menopausal onset.' }
    ],
    default: 'M'
  },

  ChestPainType: {
    id: 'ChestPainType',
    name: 'Chest Discomfort Presentation',
    unit: 'Type',
    whatItIs: 'Symptom pattern and triggers of chest pressure or discomfort.',
    whatToEnter: 'Select the description that best describes your chest symptoms.',
    whereToFind: 'Your physician consultation notes or emergency/cardiology triage summary.',
    normalRange: 'NAP (Non-Anginal) or absence of exertional symptoms.',
    concerningRange: 'ASY (Silent ischemia, common in diabetics) or TA (Classic typical exertion-induced angina).',
    whyModelUsesIt: 'Chest pain morphology is one of the strongest predictive indicators of hemodynamically significant coronary artery narrowing.',
    type: 'categorical',
    options: [
      { key: 'ASY', label: 'Asymptomatic (ASY)', desc: 'No chest pain. Can indicate silent cardiac ischemia, especially in diabetics or older adults.' },
      { key: 'NAP', label: 'Non-Anginal (NAP)', desc: 'Sharp or localized discomfort unrelated to physical exertion (often musculoskeletal or GI).' },
      { key: 'ATA', label: 'Atypical Angina (ATA)', desc: 'Meets some but not all 3 classic criteria (e.g., discomfort brought on by stress but brief).' },
      { key: 'TA', label: 'Typical Angina (TA)', desc: 'Substernal pressure precipitated by exertion and relieved within 5 minutes of rest or nitrates.' }
    ],
    default: 'ASY'
  },

  RestingBP: {
    id: 'RestingBP',
    name: 'Resting Blood Pressure',
    unit: 'mmHg',
    whatItIs: 'Systolic blood pressure (the top number) measured while seated quietly.',
    whatToEnter: 'Enter systolic pressure between 80 and 200 mmHg.',
    whereToFind: 'Home blood pressure monitor log or vital signs section of your recent clinic visit.',
    normalRange: '< 120 mmHg (Normal) | 120–129 mmHg (Elevated)',
    concerningRange: '130–139 mmHg (Stage 1 Hypertension) | ≥ 140 mmHg (Stage 2 Hypertension)',
    whyModelUsesIt: 'Sustained systolic pressure exerts shear stress against coronary endothelium, accelerating atherosclerotic plaque formation and cardiac afterload.',
    type: 'numeric',
    min: 80,
    max: 200,
    step: 1,
    default: 130
  },

  Cholesterol: {
    id: 'Cholesterol',
    name: 'Serum Cholesterol',
    unit: 'mg/dL',
    whatItIs: 'Total circulating cholesterol including LDL, HDL, and triglyceride carrier sterols.',
    whatToEnter: 'Enter serum total cholesterol, or toggle "I don’t know" to use clinical median imputation.',
    whereToFind: 'Fasting lipid panel section of your routine blood work report.',
    normalRange: '< 200 mg/dL (Desirable)',
    concerningRange: '200–239 mg/dL (Borderline High) | ≥ 240 mg/dL (High risk for arterial deposition)',
    whyModelUsesIt: 'Excess circulating cholesterol deposits into the arterial intima, forming atheromatous plaques that narrow coronary lumen.',
    type: 'numeric_optional',
    min: 100,
    max: 600,
    step: 1,
    default: 240
  },

  FastingBS: {
    id: 'FastingBS',
    name: 'Fasting Blood Sugar',
    unit: '> 120 mg/dL',
    whatItIs: 'Whether your blood glucose after an overnight fast (>8 hrs) exceeds 120 mg/dL.',
    whatToEnter: 'Select Normal (≤ 120 mg/dL) or Elevated (> 120 mg/dL).',
    whereToFind: 'Comprehensive metabolic panel (CMP) or fasting blood glucose lab test.',
    normalRange: 'Fasting blood sugar ≤ 100–120 mg/dL.',
    concerningRange: '> 120 mg/dL: Indicates impaired fasting glucose, insulin resistance, or diabetes.',
    whyModelUsesIt: 'Hyperglycemia damages microvascular beds, induces chronic endothelial inflammation, and significantly multiplies coronary disease risk.',
    type: 'categorical',
    options: [
      { key: 0, label: 'Normal (≤ 120 mg/dL)', desc: 'Glucose within non-diabetic or prediabetic reference limits.' },
      { key: 1, label: 'Elevated (> 120 mg/dL)', desc: 'Fasting hyperglycemia indicative of impaired glucose metabolism.' }
    ],
    default: 0
  },

  RestingECG: {
    id: 'RestingECG',
    name: 'Resting Electrocardiogram (ECG)',
    unit: 'Conduction',
    whatItIs: 'Baseline 12-lead electrical rhythm tracing of the heart at rest.',
    whatToEnter: 'Select the finding reported on your resting 12-lead ECG tracing.',
    whereToFind: 'Resting 12-lead ECG report from your cardiologist or routine pre-operative screening.',
    normalRange: 'Normal: Sinus rhythm without conduction delays or repolarization shifts.',
    concerningRange: 'ST (ST-T wave abnormalities) or LVH (Left Ventricular Hypertrophy chamber enlargement).',
    whyModelUsesIt: 'Resting electrical anomalies reveal preexisting myocardial strain, prior silent infarction, or chamber enlargement.',
    type: 'categorical',
    options: [
      { key: 'Normal', label: 'Normal Tracing', desc: 'Normal electrical rhythm without conduction or repolarization abnormalities.' },
      { key: 'ST', label: 'ST-T Wave Abnormality', desc: 'T-wave inversion or ST elevation/depression > 0.05 mV indicating resting ischemic burden.' },
      { key: 'LVH', label: 'Left Ventricular Hypertrophy (LVH)', desc: 'Electrical voltage criteria showing thickened muscle in the left pumping chamber.' }
    ],
    default: 'Normal'
  },

  MaxHR: {
    id: 'MaxHR',
    name: 'Maximum Heart Rate Achieved',
    unit: 'BPM',
    whatItIs: 'The highest heart rate reached during an exercise treadmill stress test.',
    whatToEnter: 'Enter peak beats per minute (BPM) reached at peak exertion (60–220).',
    whereToFind: 'Exercise stress test report (Bruce treadmill protocol summary).',
    normalRange: 'Expected peak target is ~85% of age-predicted maximum (approx 220 − Age).',
    concerningRange: '< 120 BPM in adults under 65: Chronotropic incompetence (inability of the heart to accelerate under exertion).',
    whyModelUsesIt: 'Failure to achieve age-appropriate peak heart rate is an independent marker of coronary disease and cardiac autonomic dysfunction.',
    type: 'numeric',
    min: 60,
    max: 220,
    step: 1,
    default: 145
  },

  ExerciseAngina: {
    id: 'ExerciseAngina',
    name: 'Exercise-Induced Angina',
    unit: 'Symptom',
    whatItIs: 'Whether physical exertion directly brought on chest tightness, constriction, or pain.',
    whatToEnter: 'Select No if exercise was pain-free, or Yes if chest discomfort was triggered.',
    whereToFind: 'Cardiologist treadmill stress test notes under "Subjective Symptoms".',
    normalRange: 'No (Pain-free exercise capacity).',
    concerningRange: 'Yes: Demand ischemia provoked when myocardial oxygen demand exceeds arterial supply.',
    whyModelUsesIt: 'Angina during physical workload is a hallmark indicator of obstructive coronary stenosis limiting perfusion.',
    type: 'categorical',
    options: [
      { key: 'N', label: 'No (Pain-Free)', desc: 'Exertion was completed without provoking anginal chest symptoms.' },
      { key: 'Y', label: 'Yes (Angina Provoked)', desc: 'Physical exertion triggered chest pressure, ache, or ischemic constriction.' }
    ],
    default: 'N'
  },

  Oldpeak: {
    id: 'Oldpeak',
    name: 'ST Depression (Oldpeak)',
    unit: 'mm',
    whatItIs: 'Millimeters of downward electrical displacement in the ECG ST-segment during exercise vs rest.',
    whatToEnter: 'Enter the ST depression value in millimeters (0.0 to 6.0 mm).',
    whereToFind: 'Exercise ECG stress test tracing summary under "Max ST Depression".',
    normalRange: '0.0 – 0.9 mm: Normal physiological response with minimal repolarization shift.',
    concerningRange: '1.0 – 1.9 mm (Borderline/suspicious) | ≥ 2.0 mm (Marked exercise-induced subendocardial ischemia).',
    whyModelUsesIt: 'Direct electrical indicator of cardiac muscle oxygen starvation under physical stress.',
    type: 'numeric',
    min: 0.0,
    max: 6.0,
    step: 0.1,
    default: 1.0
  },

  ST_Slope: {
    id: 'ST_Slope',
    name: 'Peak Exercise ST Slope',
    unit: 'Trajectory',
    whatItIs: 'Geometric angle/slope of the ECG ST-segment as it transitions into the T-wave at peak stress.',
    whatToEnter: 'Select whether the ST-segment was Upsloping, Flat, or Downsloping.',
    whereToFind: 'Conclusion paragraph of your treadmill exercise ECG report.',
    normalRange: 'Upsloping (Up): Rapid ascending trajectory common in healthy exercising hearts.',
    concerningRange: 'Flat: Strongly associated with coronary stenosis | Downsloping: Severe multivessel ischemia.',
    whyModelUsesIt: 'The ST slope geometry separates harmless exercise tachycardia from true myocardial perfusion deficits.',
    type: 'categorical',
    options: [
      { key: 'Up', label: 'Upsloping (Up)', desc: 'Rapid ascending curve; standard healthy physiological response to strenuous workload.' },
      { key: 'Flat', label: 'Flat (Flat)', desc: 'Horizontal depression; strong statistical correlation with obstructive coronary disease.' },
      { key: 'Down', label: 'Downsloping (Down)', desc: 'Descending trajectory; indicates severe multivessel coronary ischemia.' }
    ],
    default: 'Flat'
  }
};
