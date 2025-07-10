// src/components/CustomToolbar.tsx

// Hapus baris 'import React from 'react';' dari sini
import { Navigate, type ToolbarProps } from 'react-big-calendar';

const CustomToolbar = <TEvent extends object>({
  label,
  onNavigate,
}: ToolbarProps<TEvent>) => {
  return (
    <div className="rbc-toolbar mb-4">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate(Navigate.PREVIOUS)}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate(Navigate.TODAY)}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate(Navigate.NEXT)}>
          Next
        </button>
      </span>
      
      <div className="rbc-toolbar-label mt-2 font-bold text-lg text-center">
        {label}
      </div>
    </div>
  );
};

export default CustomToolbar;