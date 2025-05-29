
import React from 'react';
import { Card } from '@/components/ui/card';

interface ContextMenuProps {
  x: number;
  y: number;
  onAddNode: (type: 'step' | 'condition' | 'notification') => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddNode, onClose }) => {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { type: 'step' as const, label: 'Add Step', icon: '📋', description: 'Process or action' },
    { type: 'condition' as const, label: 'Add Condition', icon: '❓', description: 'Decision point' },
    { type: 'notification' as const, label: 'Add Notification', icon: '📢', description: 'Alert or message' },
  ];

  return (
    <Card 
      className="absolute bg-white border shadow-lg py-2 min-w-48 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item) => (
        <button
          key={item.type}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
          onClick={() => onAddNode(item.type)}
        >
          <span className="text-lg">{item.icon}</span>
          <div>
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-500">{item.description}</div>
          </div>
        </button>
      ))}
    </Card>
  );
};
