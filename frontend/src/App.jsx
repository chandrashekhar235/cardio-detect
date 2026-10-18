import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import Home from './pages/Home';

import ErrorBoundary from './components/ErrorBoundary';

// Lazy-load secondary pages for optimal code splitting & chunk caching
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const Science = lazy(() => import('./pages/Science'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--coral-red)] border-t-transparent animate-spin" />
      <span className="font-mono text-xs text-[var(--text-muted)]">Loading clinical intelligence modules...</span>
    </div>
  );
}

function AnimatedRoutes({ onCaseLogged, sessionCases }) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* / Home (product landing) */}
          <Route
            path="/"
            element={<Home onCaseLogged={onCaseLogged} sessionCases={sessionCases} />}
          />

          {/* /assess Assessment (clinical console) */}
          <Route
            path="/assess"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <AssessmentPage onCaseLogged={onCaseLogged} />
              </Suspense>
            }
          />

          {/* /report Case report (from latest assessment; restorable from session records) */}
          <Route
            path="/report"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ReportPage />
              </Suspense>
            }
          />

          {/* /insights Model & dataset insights */}
          <Route
            path="/insights"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <InsightsPage sessionCases={sessionCases} />
              </Suspense>
            }
          />

          {/* /science Inside the Model */}
          <Route
            path="/science"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Science />
              </Suspense>
            }
          />

          {/* /about Method, dataset, limitations, ethics, disclaimer */}
          <Route
            path="/about"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <About />
              </Suspense>
            }
          />

          {/* Legacy redirects */}
          <Route path="/investigate" element={<Navigate to="/assess" replace />} />
          <Route path="/dashboard" element={<Navigate to="/insights" replace />} />

          {/* * 404 page (flatline ECG) */}
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default function App() {
  const [sessionCases, setSessionCases] = useState(() => {
    try {
      const stored = sessionStorage.getItem('cardiodetect_session_cases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      const alreadyWelcomed = sessionStorage.getItem('cardiodetect_welcome_shown');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !alreadyWelcomed && !prefersReduced;
    } catch {
      return false;
    }
  });

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem('cardiodetect_welcome_shown', 'true');
    } catch {}
  };

  const handleCaseLogged = (newCase) => {
    setSessionCases((prev) => {
      const updated = [newCase, ...prev.filter((c) => c.caseId !== newCase.caseId)];
      try {
        sessionStorage.setItem('cardiodetect_session_cases', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <ThemeProvider>
      {showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}

      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200">
          
          {/* Global Sticky Navigation Bar with Theme Toggle, Status & Command Palette Trigger */}
          <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

          {/* Global Command Palette (Ctrl/Cmd+K) */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />

          {/* Main Animated Page Routes */}
          <main className="flex-1">
            <Suspense fallback={<RouteLoadingFallback />}>
              <AnimatedRoutes
                onCaseLogged={handleCaseLogged}
                sessionCases={sessionCases}
              />
            </Suspense>
          </main>

          {/* Institutional Calm Medical Footer with Disclaimer */}
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
