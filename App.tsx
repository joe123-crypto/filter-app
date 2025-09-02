
import React, { useState, useCallback, useEffect } from 'react';
import { Filter, ViewState } from './types';
import { INITIAL_FILTERS } from './constants';
import Marketplace from './components/Marketplace';
import ApplyFilterView from './components/ApplyFilterView';
import CreateFilterView from './components/CreateFilterView';
import { HeaderIcon } from './components/icons';
import { getFilters, saveFilter } from './services/firebaseService';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ view: 'marketplace' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const dbFilters = await getFilters();
        
        // Combine initial filters with database filters, ensuring no duplicates by name
        const combinedFilters = [...dbFilters, ...INITIAL_FILTERS];
        const uniqueFilters = Array.from(new Map(combinedFilters.map(item => [item.name, item])).values());

        setFilters(uniqueFilters);
      } catch (err) {
        console.error(err);
        setError("Could not load filters from the database. Displaying default filters.");
        setFilters(INITIAL_FILTERS); // Fallback to initial filters
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const addFilter = useCallback(async (newFilterData: Omit<Filter, 'id'>) => {
    const newFilter = await saveFilter(newFilterData);
    setFilters(prevFilters => [newFilter, ...prevFilters]);
  }, []);

  const renderView = () => {
    if (isLoading && viewState.view === 'marketplace') {
      return (
        <div className="flex flex-col items-center justify-center pt-20">
          <Spinner />
          <p className="mt-4 text-lg">Loading Filters...</p>
        </div>
      );
    }
    
    if (error && viewState.view === 'marketplace') {
        return (
            <div className="text-center pt-20 text-red-400">
                <p>{error}</p>
            </div>
        )
    }

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