
import React from 'react';

interface ConnectionDotsProps {
  pathData: string;
  isVisible: boolean;
}

export const ConnectionDots: React.FC<ConnectionDotsProps> = ({ pathData, isVisible }) => {
  if (!isVisible) return null;

  return (
    <g className="pointer-events-none">
      <circle r="4" fill="#3b82f6" opacity="0.8">
        <animateMotion dur="3s" repeatCount="indefinite" path={pathData} />
      </circle>
      <circle r="3" fill="#60a5fa" opacity="0.6">
        <animateMotion dur="3s" repeatCount="indefinite" path={pathData} begin="1s" />
      </circle>
      <circle r="2" fill="#93c5fd" opacity="0.4">
        <animateMotion dur="3s" repeatCount="indefinite" path={pathData} begin="2s" />
      </circle>
    </g>
  );
};
