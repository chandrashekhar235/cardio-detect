import React from 'react';
import AssessmentSection from '../components/AssessmentSection';

export default function Investigation({ onCaseLogged }) {
  return (
    <div className="bg-[var(--bg-canvas)] min-h-[calc(100vh-4rem)]">
      <AssessmentSection onCaseLogged={onCaseLogged} />
    </div>
  );
}
