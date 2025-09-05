/**
 * CSS Neon Logo Component - Alternative to image-based logo
 * Provides infinite resolution and true neon tube effects
 */

'use client';

import { useEffect, useState } from 'react';

interface CSSNeonLogoProps {
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CSSNeonLogo = ({ 
  className = '', 
  animated = true,
  size = 'md' 
}: CSSNeonLogoProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`neon-logo-placeholder ${className}`}></div>;
  }

  const sizeClasses = {
    sm: 'text-sm xs:text-base',
    md: 'text-lg xs:text-xl sm:text-2xl lg:text-3xl',
    lg: 'text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
    xl: 'text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'
  };

  return (
    <div className={`neon-logo-container ${className}`}>
      <div className={`neon-logo ${sizeClasses[size]} ${animated ? 'neon-animated' : ''}`}>
        <div className="neon-text-main">LITTLE LATTE LANE</div>
        <div className="neon-text-sub">Café and Deli</div>
      </div>
      
      <style jsx>{`
        .neon-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          user-select: none;
        }

        .neon-text-main {
          color: #00ffff;
          text-shadow: 
            0 0 5px #00ffff,
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            0 0 40px #00ffff,
            0 0 80px #00ffff;
          margin-bottom: 0.2em;
          line-height: 0.9;
        }

        .neon-text-sub {
          color: #ff00ff;
          font-size: 0.4em;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-shadow: 
            0 0 3px #ff00ff,
            0 0 6px #ff00ff,
            0 0 12px #ff00ff,
            0 0 24px #ff00ff;
          opacity: 0.9;
        }

        .neon-animated .neon-text-main {
          animation: neon-flicker-cyan 3s infinite alternate;
        }

        .neon-animated .neon-text-sub {
          animation: neon-flicker-magenta 4s infinite alternate;
        }

        @keyframes neon-flicker-cyan {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow: 
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 40px #00ffff,
              0 0 80px #00ffff;
          }
          20%, 24%, 55% {
            text-shadow: 
              0 0 2px #00ffff,
              0 0 5px #00ffff,
              0 0 8px #00ffff,
              0 0 12px #00ffff;
          }
        }

        @keyframes neon-flicker-magenta {
          0%, 12%, 16%, 20%, 60%, 64%, 100% {
            text-shadow: 
              0 0 3px #ff00ff,
              0 0 6px #ff00ff,
              0 0 12px #ff00ff,
              0 0 24px #ff00ff;
          }
          14%, 18%, 62% {
            text-shadow: 
              0 0 1px #ff00ff,
              0 0 3px #ff00ff,
              0 0 6px #ff00ff;
          }
        }

        .neon-logo-placeholder {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #00ffff20, #ff00ff20);
          border-radius: 8px;
          animation: pulse 2s infinite;
        }

        @media (max-width: 640px) {
          .neon-logo-container {
            letter-spacing: 0.05em;
          }
          .neon-text-sub {
            font-size: 0.35em;
          }
        }
      `}</style>
    </div>
  );
};

export default CSSNeonLogo;
