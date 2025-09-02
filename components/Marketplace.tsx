
import React from 'react';
import { Filter, ViewState } from '../types';
import FilterCard from './FilterCard';
import { PlusIcon } from './icons';

interface MarketplaceProps {
  filters: Filter[];
  setViewState: (viewState: ViewState) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ filters, setViewState }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Filter Marketplace</h2>
        <button
          onClick={() => setViewState({ view: 'create' })}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
        >
          <PlusIcon />
          <span className="hidden sm:inline">Create New Filter</span>
          <span className="sm:hidden">Create Filter</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filters.map(filter => (
          <FilterCard
            key={filter.id}
            filter={filter}
            onSelect={() => setViewState({ view: 'apply', filter })}
          />
        ))}
      </div>
    </div>
  );
};

export default Marketplace;