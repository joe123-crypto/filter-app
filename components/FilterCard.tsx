
import React from 'react';
import { Filter } from '../types';

interface FilterCardProps {
  filter: Filter;
  onSelect: () => void;
  aspectRatio: string;
}

const FilterCard: React.FC<FilterCardProps> = ({ filter, onSelect, aspectRatio }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-base-200 rounded-lg overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/20 hover:scale-105 flex flex-col justify-between break-inside-avoid mb-4 md:mb-6"
    >
      <div>
        <div className={`relative overflow-hidden ${aspectRatio}`}>
          <img
            src={filter.previewImageUrl}
            alt={`Preview of ${filter.name} filter`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <h3 className="absolute bottom-2 left-4 text-xl font-bold text-white">{filter.name}</h3>
        </div>
        <div className="p-4">
          <p className="text-content-200 text-sm">{filter.description}</p>
        </div>
      </div>
      {filter.username && (
        <div className="p-4 pt-0 mt-auto">
            <p className="text-xs text-content-200 truncate">by {filter.username}</p>
        </div>
      )}
    </div>
  );
};

export default FilterCard;