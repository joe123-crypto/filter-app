
import React, { useState, useCallback } from 'react';
import { Filter, ViewState, User } from '../types';
import { applyImageFilter } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { shareImage } from '../services/shareService';
import Spinner from './Spinner';
import { BackArrowIcon, UploadIcon, SparklesIcon, ShareIcon } from './icons';

interface ApplyFilterViewProps {
  filter: Filter;
  setViewState: (viewState: ViewState) => void;
  user: User | null;
}

const ApplyFilterView: React.FC<ApplyFilterViewProps> = ({ filter, setViewState, user }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setGeneratedImage(null);
      try {
        const base64 = await fileToBase64(file);
        setUploadedImage(base64);
      } catch (err) {
        setError('Failed to read the image file.');
      }
    }
  }, []);

  const handleApplyFilter = useCallback(async () => {
    if (!uploadedImage) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const result = await applyImageFilter(uploadedImage, filter.prompt);
      setGeneratedImage(result);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, filter.prompt]);

  const handleShare = async () => {
    if (!generatedImage) return;

    setIsSharing(true);
    setShareStatus('idle');
    setError(null);

    try {
        const result = await shareImage(generatedImage, filter, user);
        if (result === 'copied') {
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000); // Reset after 2 seconds
        }
    } catch (err) {
        if (err instanceof Error) {
            setError(`Sharing failed: ${err.message}`);
        } else {
            setError('An unknown error occurred while sharing.');
        }
        setShareStatus('error');
    } finally {
        setIsSharing(false);
    }
  };


  const displayImage = generatedImage || uploadedImage;

  return (
    <>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <button
          onClick={() => setViewState({ view: 'marketplace' })}
          className="flex items-center gap-2 text-content-200 hover:text-white mb-6 font-semibold"
        >
          <BackArrowIcon />
          Back to Marketplace
        </button>

        <div className="bg-base-200 p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="text-center mb-4 border-b border-base-300 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{filter.name}</h2>
              <p className="text-content-200 mt-1 text-sm sm:text-base">{filter.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full max-w-md aspect-square bg-base-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                {displayImage ? (
                  <img src={displayImage} alt="User upload" className="object-contain w-full h-full" />
                ) : (
                  <div className="text-center text-content-200 p-4">
                      <UploadIcon className="mx-auto h-12 w-12" />
                      <p className="mt-2">Upload an image to get started</p>
                  </div>
                )}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                        <Spinner />
                        <p className="text-white font-semibold">Applying filter...</p>
                    </div>
                )}
              </div>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            <div className="flex flex-col gap-4">
              <label htmlFor="image-upload" className="w-full text-center cursor-pointer bg-base-300 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                <span className="flex items-center justify-center gap-2"><UploadIcon /> {uploadedImage ? 'Change Image' : 'Upload Image'}</span>
              </label>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <button
                onClick={handleApplyFilter}
                disabled={!uploadedImage || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-base-300 disabled:cursor-not-allowed disabled:text-content-200 shadow-lg"
              >
                <SparklesIcon />
                {isLoading ? 'Processing...' : 'Apply Filter'}
              </button>
              
              {generatedImage && (
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ShareIcon />
                   {isSharing ? 'Sharing...' : shareStatus === 'copied' ? 'Link Copied!' : 'Share'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyFilterView;
