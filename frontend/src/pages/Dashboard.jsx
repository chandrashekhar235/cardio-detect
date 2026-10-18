import React from 'react';
import ModelInsightsSection from '../components/ModelInsightsSection';

export default function Dashboard({ sessionCases = [] }) {
  return (
    <div className="bg-[var(--bg-canvas)] min-h-[calc(100vh-4rem)]">
      <ModelInsightsSection sessionCases={sessionCases} />
    </div>
  );
}
