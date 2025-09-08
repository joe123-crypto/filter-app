
import React from 'react';
import { DollarIcon } from './icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-base-200 dark:bg-dark-base-200 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
        style={{ animation: 'scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/20 dark:bg-dark-brand-primary/20 mb-4">
          <DollarIcon className="h-8 w-8 text-brand-primary dark:text-dark-brand-primary" />
        </div>

        <h3 className="text-2xl font-bold text-content-100 dark:text-dark-content-100 mb-3">Welcome to the Creator Program!</h3>
        <p className="text-content-200 dark:text-dark-content-200 mb-6">
          If your filter stays in the <span className="font-semibold text-content-100 dark:text-dark-content-100">Trending</span> section for 10 days, you get a commission of <span className="font-bold text-content-100 dark:text-dark-content-100">$0.25</span> per day.
        </p>

        <button
          onClick={onClose}
          className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary dark:bg-dark-brand-primary dark:hover:bg-dark-brand-secondary text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
          aria-label="Close welcome message"
        >
          Start Creating!
        </button>
      </div>
      {/* Add a simple keyframe animation for the scale-up effect */}
      <style>{`
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;