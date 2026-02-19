
import React from 'react';

export const StarConstellationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-8 w-8"
    {...props}
  >
    {/* Connection lines */}
    <path d="M4 18L9 14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    <path d="M9 14L12 6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    <path d="M12 6L18 10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    <path d="M18 10L20 4" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    <path d="M9 14L15 20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

    {/* Stars */}
    <circle cx="4" cy="18" r="1.5" fill="currentColor">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="9" cy="14" r="2" fill="currentColor">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="12" cy="6" r="2.5" fill="currentColor">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="18" cy="10" r="1.8" fill="currentColor">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="4" r="1.2" fill="currentColor">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="15" cy="20" r="1.5" fill="currentColor">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.7s" repeatCount="indefinite" />
    </circle>
  </svg>
);
