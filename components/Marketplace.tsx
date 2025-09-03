
import React from 'react';
import { Filter, ViewState } from '../types';
import FilterCard from './FilterCard';
import { PlusIcon } from './icons';

interface MarketplaceProps {
  filters: Filter[];
  setViewState: (viewState: ViewState) => void;
  onCreateFilterClick: () => void;
}

const CATEGORIES = ['AI Generated', 'Useful', 'Fun'];
const ASPECT_RATIOS = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'];

const Marketplace: React.FC<MarketplaceProps> = ({ filters, setViewState, onCreateFilterClick }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Filter Marketplace</h2>
        <button
          onClick={onCreateFilterClick}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
        >
          <PlusIcon />
          <span className="hidden sm:inline">Create New Filter</span>
          <span className="sm:hidden">Create Filter</span>
        </button>
      </div>

      {filters.length === 0 && (
         <div className="text-center bg-base-200 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white">The Marketplace is Empty!</h3>
            <p className="text-content-200 mt-2 mb-4">Be the first to create and share a new filter with the community.</p>
            <button
                onClick={onCreateFilterClick}
                className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg mx-auto"
            >
                <PlusIcon />
                <span>Create a Filter</span>
            </button>
        </div>
      )}

      <div className="space-y-10">
        {CATEGORIES.map(category => {
          const categoryFilters = filters.filter(f => f.category === category);
          if (categoryFilters.length === 0) {
            return null;
          }
          return (
            <section key={category}>
              <h3 className="text-2xl font-bold text-white mb-4 border-b-2 border-base-200 pb-2">{category}</h3>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6">
                {categoryFilters.map((filter, index) => (
                  <FilterCard
                    key={filter.id}
                    filter={filter}
                    onSelect={() => setViewState({ view: 'apply', filter })}
                    aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;