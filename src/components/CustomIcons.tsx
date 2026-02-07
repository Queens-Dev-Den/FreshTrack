import React from 'react';

// Standard Lucide Refrigerator icon
export const FridgeIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <rect width="14" height="20" x="5" y="2" rx="2" />
        <path d="M5 10h14" />
        <path d="M15 7v-2" />
        <path d="M15 17v-2" />
    </svg>
);
