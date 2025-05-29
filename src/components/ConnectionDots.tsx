
import React from 'react';

interface ConnectionDotsProps {
  pathData: string;
  isVisible: boolean;
}

export const ConnectionDots: React.FC<ConnectionDotsProps> = ({ pathData, isVisible }) => {
  if (!isVisible) return null;

  return (
    <>
      <circle r="3" fill="#3b82f6" className="pointer-events-none">
        <animateMotion dur="2s" repeatCount="indefinite" path={pathData} />
      </circle>
      <circle r="2" fill="#60a5fa" className="pointer-events-none">
        <animateMotion dur="2s" repeatCount="indefinite" path={pathData} begin="0.5s" />
      </circle>
      <circle r="2" fill="#60a5fa" className="pointer-events-none">
        <animateMotion dur="2s" repeatCount="indefinite" path={pathData} begin="1s" />
      </circle>
    </>
  );
};
