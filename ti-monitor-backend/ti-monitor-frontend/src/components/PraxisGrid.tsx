import React from 'react';
import type { Praxis } from '../types';
import { PraxisCard } from './PraxisCard';

interface PraxisGridProps {
  praxen: Praxis[];
  onSelectPraxis: (praxis: Praxis) => void;
}

export const PraxisGrid: React.FC<PraxisGridProps> = ({ praxen, onSelectPraxis }) => {
  if (!praxen || praxen.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg">Verbinde mit dem Server...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {praxen.map(praxis => (
        <PraxisCard
          key={praxis.id}
          praxis={praxis}
          onClick={() => onSelectPraxis(praxis)}
        />
      ))}
    </div>
  );
};
