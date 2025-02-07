import React from 'react';

interface VerticalCollapseButtonProps {
  onClick: () => void;
  isCollapsed?: boolean;
  position?: 'left' | 'right';
}

const VerticalCollapseButton: React.FC<VerticalCollapseButtonProps> = ({ 
  onClick, 
  isCollapsed = false,
  position = 'left'
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-4 h-full ${
        position === 'left' ? 'border-r' : 'border-l'
      } border-black bg-white hover:bg-gray-50 flex items-center justify-center`}
    >
      {position === 'left' ? (isCollapsed ? '<' : '>') : (isCollapsed ? '>' : '<')}
    </button>
  );
};

export default VerticalCollapseButton; 