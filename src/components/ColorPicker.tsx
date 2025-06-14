
import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {presetColors.map((presetColor) => (
        <button
          key={presetColor}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            color === presetColor ? 'border-gray-400 scale-110' : 'border-gray-200'
          }`}
          style={{ backgroundColor: presetColor }}
          onClick={() => onChange(presetColor)}
        />
      ))}
    </div>
  );
};
