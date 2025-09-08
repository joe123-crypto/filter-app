
import React, { useState, useCallback, useEffect } from 'react';
import { Filter, ViewState, User } from './types';
import Marketplace from './components/Marketplace';
import ApplyFilterView from './components/ApplyFilterView';
import StudioView from './components/CreateFilterView';
import AuthView from './components/AuthView';
import SharedImageView from './components/SharedImageView';
import WelcomeModal from './components/WelcomeModal';
import { HeaderIcon, SunIcon, MoonIcon } from './components/icons';
import { getFilters, deleteFilter, incrementFilterAccessCount, updateFilter } from './services/firebaseService';
import { checkAndGenerateDailyTrend } from './services/dailyTrendService';
import { loadUserSession, signOut, getValidIdToken } from './services/authService';
import Spinner from './components/Spinner';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ view: 'marketplace' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // 1. Check for a logged-in user session
    const currentUser = loadUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // 2. Check for a share link in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');

    if (shareId) {
      setViewState({ view: 'shared', shareId });
      setIsLoading(false);
      // Remove the query parameter from the URL for a cleaner look
      window.history.replaceState({}, document.title, window.location.pathname);
      return; // Skip normal app initialization
    }

    // 3. Load app data
    const initializeApp = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Fetch user-created and initial filters first
        const fetchedFilters = await getFilters();
        setFilters(fetchedFilters);

        // Now, check if a new daily trend filter should be generated and add it to the list
        try {
            const newTrendingFilter = await checkAndGenerateDailyTrend();
            if (newTrendingFilter) {
                setFilters(prevFilters => [newTrendingFilter, ...prevFilters]);
            }
        } catch (trendError) {
            // This is a non-critical error, so we just log it and continue.
            console.warn("Could not generate daily AI filter:", trendError);
        }

      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while loading filters.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  const addFilter = useCallback((newFilter: Filter) => {
    setFilters(prevFilters => [newFilter, ...prevFilters]);
    // Go back to marketplace after successful creation
    setViewState({ view: 'marketplace' });
  }, []);
  
  const handleSignOut = () => {
    signOut();
    setUser(null);
    setViewState({ view: 'marketplace' });
  };

  const handleDeleteFilter = useCallback(async (filterId: string) => {
    if (!user || user.email !== 'munemojoseph332@gmail.com') {
      const err = "You don't have permission to delete filters.";
      setError(err);
      throw new Error(err);
    }
    
    try {
      setError(null);
      const idToken = await getValidIdToken();
      if (!idToken) {
          handleSignOut();
          throw new Error("Your session has expired. Please sign in again.");
      }
      await deleteFilter(filterId, idToken);
      setFilters(prevFilters => prevFilters.filter(f => f.id !== filterId));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while deleting the filter.");
      }
      // Re-throw to be caught by the calling component
      throw err;
    }
  }, [user]);

  const handleEditFilter = (filter: Filter) => {
    if (!user || user.email !== 'munemojoseph332@gmail.com') {
      setError("You don't have permission to edit filters.");
      return;
    }
    setViewState({ view: 'edit', filter });
  };

  const handleUpdateFilter = useCallback(async (filterToUpdate: Filter) => {
    if (!user || user.email !== 'munemojoseph332@gmail.com') {
      const err = "You don't have permission to update filters.";
      setError(err);
      throw new Error(err);
    }
    
    try {
        setError(null);
        const idToken = await getValidIdToken();
        if (!idToken) {
            handleSignOut();
            throw new Error("Your session has expired. Please sign in again.");
        }
        const { id, userId, username, accessCount, createdAt, ...dataToUpdate } = filterToUpdate;
        const updatedFilter = await updateFilter(id, dataToUpdate, idToken);
        setFilters(prevFilters => prevFilters.map(f => (f.id === id ? updatedFilter : f)));
        setViewState({ view: 'marketplace' });
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while updating the filter.");
        }
        // Re-throw to be caught by the calling component
        throw err;
    }
  }, [user]);

  const handleSelectFilter = useCallback((filter: Filter) => {
    setViewState({ view: 'apply', filter });
    // Optimistically update the access count in the background
    incrementFilterAccessCount(filter.id);
    // Optimistically update the local state for a snappier UI
    setFilters(prevFilters => prevFilters.map(f => 
        f.id === filter.id ? { ...f, accessCount: (f.accessCount || 0) + 1 } : f
    ));
  }, []);


  const handleSignInSuccess = (signedInUser: User) => {
    setUser(signedInUser);
    setViewState({ view: 'marketplace' });
    setIsWelcomeModalOpen(true);
  };
  
  const renderView = () => {
    if (isLoading && viewState.view !== 'shared') {
      return (
        <div className="flex flex-col items-center justify-center pt-20">
          <Spinner className="h-10 w-10 text-brand-primary dark:text-dark-brand-primary"/>
          <p className="mt-4 text-lg text-content-200 dark:text-dark-content-200">Loading Filters...</p>
        </div>
      );
    }

    switch (viewState.view) {
      case 'marketplace':
        return (
          <Marketplace
            filters={filters}
            onSelectFilter={handleSelectFilter}
            user={user}
            onDeleteFilter={handleDeleteFilter}
            onEditFilter={handleEditFilter}
          />
        );
      case 'apply':
        return <ApplyFilterView filter={viewState.filter} setViewState={setViewState} user={user} />;
      case 'create':
        return <StudioView setViewState={setViewState} addFilter={addFilter} user={user} />;
      case 'edit':
        // Editing will now be handled within a different flow if needed, or can be a future feature.
        // For now, redirecting to the studio.
        return <StudioView setViewState={setViewState} filterToEdit={viewState.filter} onUpdateFilter={handleUpdateFilter} user={user} />;
      case 'auth':
        return <AuthView setViewState={setViewState} onSignInSuccess={handleSignInSuccess} />;
      case 'shared':
        return <SharedImageView shareId={viewState.shareId} setViewState={setViewState} />;
      default:
        // This is exhaustive and should not be reached with TypeScript
        return <div>Unknown view state</div>;
    }
  };
  
  return (
    <div className="bg-base-100 dark:bg-dark-base-100 min-h-screen text-content-100 dark:text-dark-content-100 font-sans flex flex-col transition-colors duration-300">
      <div className="flex-grow p-4 sm:p-6 md:p-8">
        <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewState({ view: 'marketplace' })}>
            <HeaderIcon />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-content-100 dark:text-dark-content-100">Genie</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {viewState.view === 'marketplace' && (
              <button onClick={() => setViewState({ view: 'create' })} className="bg-base-200 hover:bg-base-300 dark:bg-dark-base-200 dark:hover:bg-dark-base-300 text-content-100 dark:text-dark-content-100 font-semibold py-2 px-4 rounded-lg text-sm transition-colors border border-border-color dark:border-dark-border-color shadow-sm">
                Create filter
              </button>
            )}
             <button onClick={toggleTheme} className="p-2 rounded-full bg-base-200 hover:bg-base-300 dark:bg-dark-base-200 dark:hover:bg-dark-base-300 border border-border-color dark:border-dark-border-color transition-colors" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
             </button>
             {user ? (
              <>
                <span className="text-content-200 dark:text-dark-content-200 hidden sm:inline">{user.email}</span>
              </>
            ) : (
              <button onClick={() => setViewState({ view: 'auth' })} className="bg-brand-primary hover:bg-brand-secondary dark:bg-dark-brand-primary dark:hover:bg-dark-brand-secondary text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                Sign In
              </button>
            )}
          </div>
        </header>
        <main className="max-w-7xl mx-auto w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          )}
          {renderView()}
        </main>
      </div>
      <footer className="w-full text-center py-4 px-4 sm:px-6 md:px-8">
        <p className="text-sm text-content-200 dark:text-dark-content-200">&copy; {new Date().getFullYear()} Genie. All rights reserved.</p>
      </footer>
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </div>
  );
};

export default App;