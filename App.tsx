
import React, { useState, useCallback } from 'react';
import { Filter, ViewState } from './types';
import { INITIAL_FILTERS } from './constants';
import Marketplace from './components/Marketplace';
import ApplyFilterView from './components/ApplyFilterView';
import CreateFilterView from './components/CreateFilterView';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>(INITIAL_FILTERS);
  const [viewState, setViewState] = useState<ViewState>({ view: 'marketplace' });

  const addFilter = useCallback((newFilterData: Omit<Filter, 'id'>) => {
    const newFilter: Filter = {
      ...newFilterData,
      id: `local-${Date.now()}-${Math.random()}` // Create a unique local ID
    };
    setFilters(prevFilters => [newFilter, ...prevFilters]);
  }, []);

  const renderView = () => {
    switch (viewState.view) {
      case 'marketplace':
        return <Marketplace filters={filters} setViewState={setViewState} />;
      case 'apply':
        return <ApplyFilterView filter={viewState.filter} setViewState={setViewState} />;
      case 'create':
        return <CreateFilterView addFilter={addFilter} setViewState={setViewState} />;
      default:
        return <Marketplace filters={filters} setViewState={setViewState} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <header className="bg-base-200/50 backdrop-blur-lg sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center">
           <HeaderIcon />
           <h1 className="text-xl md:text-2xl font-bold text-white ml-3">Gemini Filter Fusion</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 text-content-200 text-sm">
        <p>Powered by Gemini 2.5 Flash Image Preview</p>
      </footer>
    </div>
  );
};

export default App;