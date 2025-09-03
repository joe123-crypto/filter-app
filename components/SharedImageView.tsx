
import React, { useState, useEffect } from 'react';
import { Share, ViewState } from '../types';
import { getSharedImage } from '../services/firebaseService';
import Spinner from './Spinner';

interface SharedImageViewProps {
  shareId: string;
  setViewState: (viewState: ViewState) => void;
}

const SharedImageView: React.FC<SharedImageViewProps> = ({ shareId, setViewState }) => {
  const [shareData, setShareData] = useState<Share | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSharedImage(shareId);
        setShareData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while loading the shared image.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchShare();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner />
        <p className="mt-4 text-lg text-content-200">Loading shared image...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-base-200 p-8 rounded-lg max-w-xl mx-auto">
        <h3 className="text-xl font-bold text-white">Could Not Load Image</h3>
        <p className="text-red-400 mt-2">{error}</p>
        <button
          onClick={() => setViewState({ view: 'marketplace' })}
          className="mt-6 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Explore Other Filters
        </button>
      </div>
    );
  }

  if (!shareData) {
    return null; // Should be handled by loading/error states
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in text-center">
      <div className="bg-base-200 p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Image created with the "{shareData.filterName}" filter
        </h2>
        {shareData.username && (
          <p className="text-content-200 mt-2">Shared by {shareData.username}</p>
        )}
        <div className="my-6 w-full aspect-square bg-base-300 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={shareData.imageUrl}
            alt={`Image created with ${shareData.filterName} filter`}
            className="object-contain w-full h-full"
          />
        </div>
        <button
          onClick={() => setViewState({ view: 'marketplace' })}
          className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
        >
          Create Your Own!
        </button>
      </div>
    </div>
  );
};

export default SharedImageView;
