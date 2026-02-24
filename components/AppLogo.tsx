
import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 40, className = "", animate = false }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className} ${animate ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Glow */}
        <circle cx="50" cy="50" r="45" fill="url(#logo_glow)" fillOpacity="0.1" />
        
        {/* Main Raindrop Shape */}
        <path 
          d="M50 92C69.33 92 85 76.33 85 57C85 37.67 50 8 50 8C50 8 15 37.67 15 57C15 76.33 30.67 92 50 92Z" 
          stroke="#2DD4BF" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Sprout Inside */}
        <path 
          d="M50 75V45M50 55C50 55 62 50 62 40C62 30 50 35 50 35C50 35 38 30 38 40C38 50 50 55 50 55Z" 
          fill="#2DD4BF"
          className={animate ? 'animate-bounce' : ''}
          style={{ transformOrigin: 'center' }}
        />

        <defs>
          <radialGradient id="logo_glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(45)">
            <stop stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AppLogo;
