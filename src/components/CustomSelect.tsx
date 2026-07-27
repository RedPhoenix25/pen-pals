"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function CustomSelect({ options, value, onChange, style, placeholder = 'Select...' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', fontSize: 12, ...style }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          borderRadius: '4px',
          padding: '6px 8px',
          fontSize: 'inherit',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-secondary)', marginLeft: '6px', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                fontSize: 'inherit',
                color: opt.value === value ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: opt.value === value ? 'var(--accent-color)' : 'transparent',
                transition: 'background 0.1s, color 0.1s'
              }}
              onMouseEnter={e => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
