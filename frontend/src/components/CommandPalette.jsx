import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Activity,
  Sliders,
  BarChart3,
  Cpu,
  Info,
  Sun,
  Moon,
  Printer,
  Sparkles,
  Command
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { EASE_OUT_EXPO } from '../utils/motion';

export default function CommandPalette({ isOpen, onClose, onLoadPreset }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const commands = [
    { id: 'home', label: 'Go to Product Overview', group: 'Navigation', icon: Activity, action: () => navigate('/') },
    { id: 'assess', label: 'Start Clinical Assessment', group: 'Navigation', icon: Sliders, action: () => navigate('/assess') },
    { id: 'report', label: 'View Latest Case Report', group: 'Navigation', icon: Activity, action: () => navigate('/report') },
    { id: 'insights', label: 'Explore Model & Dataset Insights', group: 'Navigation', icon: BarChart3, action: () => navigate('/insights') },
    { id: 'science', label: 'Inspect Model Architecture (Science)', group: 'Navigation', icon: Cpu, action: () => navigate('/science') },
    { id: 'about', label: 'Read Method, Dataset & Ethics', group: 'Navigation', icon: Info, action: () => navigate('/about') },
    {
      id: 'theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      group: 'Settings',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },
    {
      id: 'preset-healthy',
      label: 'Load Preset: Healthy Baseline (Athletic)',
      group: 'Presets',
      icon: Sparkles,
      action: () => {
        if (onLoadPreset) onLoadPreset('healthy');
        navigate('/assess');
      }
    },
    {
      id: 'preset-moderate',
      label: 'Load Preset: Moderate Vitals',
      group: 'Presets',
      icon: Sparkles,
      action: () => {
        if (onLoadPreset) onLoadPreset('moderate');
        navigate('/assess');
      }
    },
    {
      id: 'preset-acute',
      label: 'Load Preset: Acute Ischemia / High Risk',
      group: 'Presets',
      icon: Sparkles,
      action: () => {
        if (onLoadPreset) onLoadPreset('acute');
        navigate('/assess');
      }
    },
    {
      id: 'print',
      label: 'Print Case Summary Document',
      group: 'Actions',
      icon: Printer,
      action: () => window.print()
    }
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="relative w-full max-w-xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, navigate, or load clinical presets..."
                className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none"
              />
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                ESC
              </kbd>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-muted)] font-mono">
                  No matching clinical commands found.
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-cyan-subtle)] text-[var(--text-main)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="text-xs font-medium">{cmd.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                        {cmd.group}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Tips */}
            <div className="px-4 py-2 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>•</span>
                <span>↵ Select</span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>CardioDetect Quick Console</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
