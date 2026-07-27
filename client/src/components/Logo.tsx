import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = false, className = '' }: LogoProps) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Isometric Data Cube - Clean, Institutional, Flat Vector Design */}
        
        {/* Top Face - Bright Blue */}
        <path d="M32 10L56 24L32 38L8 24L32 10Z" fill="#3B82F6" />
        
        {/* Left Face - Mid Blue */}
        <path d="M8 24L32 38V62L8 48V24Z" fill="#2563EB" />
        
        {/* Right Face - Dark Navy */}
        <path d="M56 24L32 38V62L56 48V24Z" fill="#1E3A8A" />
        
        {/* Abstract Data Bars on Right Face */}
        <path d="M38 44V55" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <path d="M44 40.5V51" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <path d="M50 34V47" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        
        {/* Minimalist Grid Line on Top Face */}
        <path d="M20 24L44 24" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        <path d="M32 17L32 31" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.1 }}>
          <span style={{ 
            fontWeight: 700, 
            fontSize: `${Math.max(size * 0.55, 16)}px`, 
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
          }}>
            Quant<span style={{ color: '#3B82F6', fontWeight: 800 }}>Adv</span>
          </span>
          <span style={{ 
            fontSize: `${Math.max(size * 0.22, 9)}px`, 
            color: 'var(--color-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: 2,
          }}>
            Algorithmic Engine
          </span>
        </div>
      )}
    </div>
  );
}
