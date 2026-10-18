import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Code2,
  ChevronRight
} from 'lucide-react';
import InteractiveKNNPlot from './InteractiveKNNPlot';
import { fadeUpVariant, staggerContainer, EASE_OUT_EXPO } from '../utils/motion';

const PIPELINE_STAGES = [
  {
    id: 1,
    num: '01',
    name: 'Clinical Feature Vector',
    subtitle: '11 Raw Patient Biomarkers',
    summary: 'Ingests patient demographic, resting vitals, and post-exercise ECG indicators.',
    description: 'Patient parameters are validated against boundary constraints (e.g. Age 18–100, RestingBP 60–240 mmHg) before ingestion by the ColumnTransformer.',
    code: 'input_df = pd.DataFrame([{ "Age": 54, "Sex": "M", "ChestPainType": "ASY", ... }])',
    formula: 'X = [x₁, x₂, x₃, ..., x₁₁] ∈ ℝ¹¹',
    rationale: 'Clinical boundaries prevent physiological anomalies from contaminating distance calculations.'
  },
  {
    id: 2,
    num: '02',
    name: 'Missing-Value Imputation',
    subtitle: 'SimpleImputer(strategy="median")',
    summary: 'Substitutes unrecorded zero entries in continuous biomarkers.',
    description: 'In the clinical dataset, unrecorded values in RestingBP and Cholesterol are recorded as zeros. The pipeline replaces zeros with the median of training instances (RestingBP: 130 mmHg, Cholesterol: 223 mg/dL).',
    code: 'SimpleImputer(missing_values=0, strategy="median")',
    formula: 'x̃_j = median({ x_ij | x_ij ≠ 0 })',
    rationale: 'Physiological zeros are biological impossibilities. Median imputation preserves distribution medians without leaking test distributions.'
  },
  {
    id: 3,
    num: '03',
    name: 'StandardScaler Normalization',
    subtitle: 'StandardScaler(with_mean=True, with_std=True)',
    summary: 'Standardizes continuous measurements to zero mean and unit variance.',
    description: 'Computes z = (x - μ) / σ for each of the 6 numeric indicators (Age, RestingBP, Cholesterol, FastingBS, MaxHR, Oldpeak).',
    code: 'StandardScaler().fit_transform(X_numeric)',
    formula: 'z_i = (x_i - μ) / σ',
    rationale: 'Euclidean distance squares coordinate discrepancies. Without scaling, cholesterol (0–600) would completely overpower ST depression (0–6 mm).'
  },
  {
    id: 4,
    num: '04',
    name: 'One-Hot Categorical Encoding',
    subtitle: 'OneHotEncoder(handle_unknown="ignore")',
    summary: 'Expands non-ordinal categories into orthogonal binary coordinates.',
    description: 'Sex (2 categories), ChestPainType (4 categories), RestingECG (3 categories), ExerciseAngina (2 categories), and ST_Slope (3 categories) are transformed into orthogonal binary flags.',
    code: 'OneHotEncoder(sparse_output=False, handle_unknown="ignore")',
    formula: 'c ∈ {ASY, NAP, ATA, TA} ↦ e_c ∈ {0, 1}⁴',
    rationale: 'Prevents false mathematical ordering (e.g. implying ASY > ATA > TA) by ensuring every category is equidistant in Euclidean space.'
  },
  {
    id: 5,
    num: '05',
    name: 'K-Nearest Neighbors Engine',
    subtitle: 'KNeighborsClassifier(n_neighbors=5, metric="minkowski")',
    summary: 'Projects query vector into 15D space and queries 5 closest training instances.',
    description: 'Computes Euclidean distances to all 734 training vectors. The 5 closest neighbors cast equal votes. If ≥3 neighbors exhibit coronary heart disease, the query is assigned the positive risk class.',
    code: 'KNeighborsClassifier(n_neighbors=5, p=2).fit(X_train, y_train)',
    formula: 'd(p, q) = √( Σ_{i=1}^{15} (p_i - q_i)² )',
    rationale: 'Non-parametric flexibility allows the model to fit complex, multi-modal biomarker clusters without assuming a linear separation hyperplane.'
  },
  {
    id: 6,
    num: '06',
    name: 'Consensus & Probability Synthesis',
    subtitle: 'Majority Consensus & Risk Level Stratification',
    summary: 'Synthesizes predicted class, confidence percentage, and biomarker evidence.',
    description: 'The probability score represents the fraction of the k=5 nearest neighbors sharing the predicted class (e.g. 4/5 = 80%). This is paired with contributing factors and clinical recommendations.',
    code: 'probabilities = pipeline.predict_proba(input_df)[0]',
    formula: 'P(y = 1 | x) = (1 / k) Σ_{i ∈ N_k(x)} I(y_i = 1)',
    rationale: 'Provides transparent heuristic probability reflecting local case clustering rather than an opaque black-box verdict.'
  }
];

export default function InsideModelSection() {
  const [activeStageId, setActiveStageId] = useState(1);
  const activeStage = PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];

  return (
    <section id="inside-the-model" className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative">
      <div className="site-container space-y-16">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl space-y-3"
        >
          <motion.div
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] text-xs font-mono uppercase tracking-wider"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Pipeline Architecture & Mathematical Rigor</span>
          </motion.div>

          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-main)] tracking-tight"
          >
            Inside the Model
          </motion.h2>

          <motion.p variants={fadeUpVariant} className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            CardioDetect uses a reproducible scikit-learn pipeline transforming 11 clinical biomarkers into a standardized 15-dimensional coordinate space. Below is the interactive stage architecture and geometry behind its predictions.
          </motion.p>
        </motion.div>

        {/* Stripe Press-style Walkthrough: Left Progress Rail (5 cols) + Right Sticky Visual (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5 COLS: Vertical Progress Rail */}
          <div className="lg:col-span-5 space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] block mb-3">
              Sequential Execution Stages (01–06)
            </span>

            {PIPELINE_STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageId(stage.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan-subtle)] shadow-sm'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-bold ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                        {stage.num}
                      </span>
                      <div>
                        <h4 className={`text-sm font-semibold ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-secondary)]'}`}>
                          {stage.name}
                        </h4>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] block">
                          {stage.subtitle}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[var(--accent-cyan)] translate-x-1' : 'text-[var(--text-muted)]'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT 7 COLS: Sticky Stage Technical Card */}
          <div className="lg:col-span-7 sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                className="product-card-glass p-6 sm:p-8 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 flex items-center justify-center font-mono font-bold text-sm">
                      {activeStage.num}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-[var(--text-main)]">
                        {activeStage.name}
                      </h3>
                      <span className="text-xs font-mono text-[var(--accent-cyan)]">
                        {activeStage.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    Stage {activeStage.id} of 6
                  </span>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-semibold block">
                    Execution Details:
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {activeStage.description}
                  </p>
                </div>

                {/* Code Snippet Box */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                    <span>Scikit-Learn Implementation:</span>
                  </span>
                  <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-main)] overflow-x-auto">
                    <code>{activeStage.code}</code>
                  </div>
                </div>

                {/* Mathematical Formulation */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] font-semibold block">
                    Mathematical Formulation:
                  </span>
                  <div className="font-mono text-xs font-bold text-[var(--accent-cyan)]">
                    {activeStage.formula}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] pt-1">
                    {activeStage.rationale}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Interactive 2D Feature Space Plot */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="space-y-1 max-w-2xl">
            <h3 className="font-display font-bold text-xl text-[var(--text-main)]">
              Interactive Coordinate Space & k-Neighbors Voting
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Experiment with patient classification dynamics. Reposition the query vector to witness how nearest neighbors cluster and vote in real time.
            </p>
          </div>

          <InteractiveKNNPlot />
        </div>

      </div>
    </section>
  );
}
