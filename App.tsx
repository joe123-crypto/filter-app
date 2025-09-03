
import React, { useState, useCallback, useEffect } from 'react';
import { Filter, ViewState, User } from './types';
import Marketplace from './components/Marketplace';
import ApplyFilterView from './components/ApplyFilterView';
import CreateFilterView from './components/CreateFilterView';
import AuthView from './components/AuthView';
import SharedImageView from './components/SharedImageView';
import { HeaderIcon } from './components/icons';
import { getFilters } from './services/firebaseService';
import { checkAndGenerateDailyTrend } from './services/dailyTrendService';
import { loadUserSession, signOut } from './services/authService';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ view: 'marketplace' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

        const fetchedFilters = await getFilters();
        setFilters(fetchedFilters);

        // Temporarily disable the daily trend filter generation
        /*
        try {
            const newTrendingFilter = await checkAndGenerateDailyTrend();
            if (newTrendingFilter) {
                setFilters(prevFilters => [newTrendingFilter, ...prevFilters]);
            }
        } catch (trendError) {
            console.warn("Could not generate daily trend filter:", trendError);
        }
        */

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
  
  const handleSignInSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setViewState({ view: 'marketplace' });
  };
  
  const handleSignOut = () => {
    signOut();
    setUser(null);
    setViewState({ view: 'marketplace' });
  };
  
  const handleCreateFilterClick = () => {
    if (user) {
        setViewState({ view: 'create' });
    } else {
        setViewState({ view: 'auth' });
    }
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner />
          <p className="mt-4 text-lg text-content-200">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 bg-base-200 p-6 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-2 text-white">An Error Occurred</h3>
          <p>{error}</p>
          <p className="text-sm text-content-200 mt-2">This might be due to an incorrect Firebase configuration, a missing index, or a network issue.</p>
        </div>
      );
    }

    switch (viewState.view) {
      case 'marketplace':
        return <Marketplace filters={filters} setViewState={setViewState} onCreateFilterClick={handleCreateFilterClick} />;
      case 'apply':
        return <ApplyFilterView filter={viewState.filter} setViewState={setViewState} user={user} />;
      case 'create':
        return <CreateFilterView addFilter={addFilter} setViewState={setViewState} user={user} />;
      case 'auth':
        return <AuthView onSignInSuccess={handleSignInSuccess} setViewState={setViewState}/>;
      case 'shared':
        return <SharedImageView shareId={viewState.shareId} setViewState={setViewState} />;
      default:
        return <Marketplace filters={filters} setViewState={setViewState} onCreateFilterClick={handleCreateFilterClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <header className="bg-base-200/50 backdrop-blur-lg sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div 
                className="flex items-center cursor-pointer"
                onClick={() => setViewState({ view: 'marketplace' })}
            >
               <HeaderIcon />
               <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white ml-3">Gemini Filter Fusion</h1>
            </div>
            <div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-content-200 hidden sm:inline">{user.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="bg-base-300 hover:bg-red-500/50 text-white text-sm font-bold py-2 px-3 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setViewState({ view: 'auth' })}
                        className="bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                        Sign In / Sign Up
                    </button>
                )}
            </div>
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
