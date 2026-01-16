
import React from 'react';

export const BeeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-8 w-8"
    {...props}
  >
    <path 
      d="M12 2L9 7H15L12 2Z" 
      fill="currentColor" 
    />
    <path 
      d="M7 10C7 8.34315 8.34315 7 10 7H14C15.6569 7 17 8.34315 17 10V14C17 15.6569 15.6569 17 14 17H10C8.34315 17 7 15.6569 7 14V10Z" 
      fill="currentColor" 
    />
    <path 
      d="M10 19L12 22L14 19H10Z" 
      fill="currentColor" 
    />
    <path 
      d="M17 9.5C18.5 8.5 21 8.5 22 10C23 11.5 21.5 14.5 18 14.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M7 9.5C5.5 8.5 3 8.5 2 10C1 11.5 2.5 14.5 6 14.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    <rect x="9" y="9" width="6" height="1.5" fill="black" />
    <rect x="9" y="12" width="6" height="1.5" fill="black" />
  </svg>
);
