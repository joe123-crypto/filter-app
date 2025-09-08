
import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';
import { User, ViewState } from '../types';
import Spinner from './Spinner';
import { BackArrowIcon } from './icons';

interface AuthViewProps {
  onSignInSuccess: (user: User) => void;
  setViewState: (viewState: ViewState) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSignInSuccess, setViewState }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const authFunction = action === 'signIn' ? signIn : signUp;
      const user = await authFunction(email, password);
      onSignInSuccess(user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
        <button
            onClick={() => setViewState({ view: 'marketplace' })}
            className="flex items-center gap-2 text-content-200 dark:text-dark-content-200 hover:text-content-100 dark:hover:text-dark-content-100 mb-6 font-semibold"
        >
            <BackArrowIcon />
            Back to Marketplace
        </button>

      <div className="bg-base-200 dark:bg-dark-base-200 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-content-100 dark:text-dark-content-100 text-center mb-6">Join or Sign In</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-100 dark:text-dark-content-100 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-base-100 dark:bg-dark-base-300 border border-border-color dark:border-dark-border-color rounded-lg px-3 py-2 text-content-100 dark:text-dark-content-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-dark-brand-primary focus:outline-none"
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-content-100 dark:text-dark-content-100 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-base-100 dark:bg-dark-base-300 border border-border-color dark:border-dark-border-color rounded-lg px-3 py-2 text-content-100 dark:text-dark-content-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-dark-brand-primary focus:outline-none"
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-center text-sm">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => handleAuthAction('signIn')}
              disabled={isLoading}
              className="flex-1 flex justify-center items-center bg-brand-primary hover:bg-brand-secondary dark:bg-dark-brand-primary dark:hover:bg-dark-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? <Spinner className="w-5 h-5 text-white" /> : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleAuthAction('signUp')}
              disabled={isLoading}
              className="flex-1 flex justify-center items-center bg-base-300 hover:bg-gray-300 dark:bg-dark-base-300 dark:hover:bg-gray-600 text-content-100 dark:text-dark-content-100 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? <Spinner className="w-5 h-5" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;