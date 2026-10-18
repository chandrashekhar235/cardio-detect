import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Command
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchHealth } from '../api';

export default function Navbar({ onOpenCommandPalette }) {
  const { theme, toggleTheme } = useTheme();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor backend health
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await fetchHealth();
        if (isMounted) {
          if (res && res.status === 'healthy' && res.model_loaded) {
            setBackendStatus('online');
          } else {
            setBackendStatus('offline');
          }
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Assess', path: '/assess' },
    { name: 'Report', path: '/report' },
    { name: 'Insights', path: '/insights' },
    { name: 'Science', path: '/science' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full frosted-glass border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="site-container-wide h-16 flex items-center justify-between">
        
        {/* Left: Product Logo & Tag */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--coral-red-subtle)] border border-[var(--coral-red)]/30 flex items-center justify-center text-[var(--coral-red)] shadow-sm group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
              <path d="M 2,12 L 6,12 L 8,7 L 11,17 L 14,9 L 16,14 L 18,12 L 22,12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-[var(--text-main)] leading-tight">
              CardioDetect
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] uppercase">
              Clinical Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Desktop Route Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-xs lg:text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-[var(--text-main)] bg-[var(--bg-elevated)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]/60'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: Command Palette Trigger + Backend Status + Theme Toggle + Assessment CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Command Palette Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Command Palette (Ctrl+K / Cmd+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Cmd+K</span>
          </button>

          {/* Backend Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono"
            title={
              backendStatus === 'online'
                ? 'FastAPI & Scikit-Learn Engine Online'
                : backendStatus === 'checking'
                ? 'Connecting to Engine...'
                : 'Backend Engine Offline'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-[var(--medical-green)] shadow-xs shadow-emerald-500/50'
                  : backendStatus === 'checking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-[var(--coral-red)]'
              }`}
            />
            <span className="text-[var(--text-secondary)] hidden xl:inline">
              {backendStatus === 'online' ? 'Engine Ready' : backendStatus === 'checking' ? 'Connecting' : 'Offline'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark and light theme"
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => navigate('/assess')}
            className="btn-primary text-xs py-2 px-3.5 shadow-sm hidden sm:inline-flex"
          >
            <span>Start assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden frosted-glass border-b border-[var(--border-subtle)] p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] font-semibold text-[var(--text-main)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/60'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCommandPalette();
              }}
              className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1 py-1"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Command Palette</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/assess');
              }}
              className="btn-primary text-xs py-2 px-4"
            >
              <span>Start assessment</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
