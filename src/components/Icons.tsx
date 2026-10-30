import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official Mastercard MADE #search vector path (custom-icons.svg, viewBox 0 0 24 24)
 */
export const SearchIcon: React.FC<IconProps> = ({ className, size = 14 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M9.083 0a9.083 9.083 0 016.936 14.948L24 22.93 22.93 24l-7.982-7.981A9.083 9.083 0 119.083 0zm.093 1.412a7.765 7.765 0 100 15.53 7.765 7.765 0 000-15.53z"
      fill="currentColor"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="0.45"
    />
  </svg>
);

/**
 * Official Mastercard MADE #close-1.5-thick vector path (custom-icons.svg, viewBox 0 0 24 24)
 */
export const CloseIcon: React.FC<IconProps> = ({ className, size = 14 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M22.938 0L24 1.062 13.061 12 24 22.938 22.938 24 12 13.061 1.062 24 0 22.938 10.938 12 0 1.062 1.062 0 12 10.938 22.938 0z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

/**
 * Official Mastercard MADE #arrow-head-right vector path (icons.svg, viewBox 0 0 24 24)
 */
export const ChevronRightIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 22.753L6.252 24l11.96-12L6.253 0 5 1.247 15.717 12z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

/**
 * Official Mastercard MADE #arrow-head-left vector path (icons.svg, viewBox 0 0 24 24)
 */
export const ChevronLeftIcon: React.FC<IconProps> = ({ className, size = 16 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M18.213 22.753L16.96 24 5 12 16.96 0l1.253 1.247L7.495 12z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

/**
 * Mastercard mccom-icons icon-Arrow-Diagonal (\f103) for [target="_blank"] links
 */
export const DiagonalArrowIcon: React.FC<IconProps> = ({ className, size = 14 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M7 5h12v12h-1.6V7.73L5.63 19.5 4.5 18.37 16.27 6.6H7V5z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Mastercard mccom-icons icon-Curved-Right-Arrow (\f113) for Algolia mid-query items
 */
export const CurvedRightArrowIcon: React.FC<IconProps> = ({ className, size = 12 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 3h1.75v8.25A3.75 3.75 0 009.5 15h9.63l-4.2-4.2 1.24-1.24L22.5 15.9l-6.33 6.33-1.24-1.24 4.2-4.24H9.5A5.5 5.5 0 014 11.25V3z"
      fill="currentColor"
    />
  </svg>
);
