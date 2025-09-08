
import React, { useState, useCallback } from 'react';
import { Filter, ViewState, User } from '../types';
import { applyImageFilter } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { shareImage } from '../services/shareService';
import Spinner from './Spinner';
import { BackArrowIcon, UploadIcon, SparklesIcon, ShareIcon, ReimagineIcon } from './icons';

interface ApplyFilterViewProps {
  filter: Filter;
  setViewState: (viewState: ViewState) => void;
  user: User | null;
}

const ImageUploader: React.FC<{
  id: string;
  image: string | null;
  onUpload: (base64: string) => void;
  label: string;
  onError: (error: string) => void;
}> = ({ id, image, onUpload, label, onError }) => {
    
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                onUpload(base64);
            } catch (err) {
                onError('Failed to read the image file.');
            }
        }
    };

    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-content-200 dark:text-dark-content-200 mb-2 text-center">{label}</label>
            <div className="w-full aspect-square bg-base-300 dark:bg-dark-base-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-border-color dark:border-dark-border-color">
                {image ? (
                    <img src={image} alt={label} className="object-contain w-full h-full" />
                ) : (
                    <div className="text-center text-content-200 dark:text-dark-content-200 p-4">
                        <UploadIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2 text-sm">Upload an image</p>
                    </div>
                )}
                 <input id={id} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
                 <label htmlFor={id} className="absolute inset-0 cursor-pointer focus:outline-none"></label>
            </div>
        </div>
    );
};


const ApplyFilterView: React.FC<ApplyFilterViewProps> = ({ filter, setViewState, user }) => {
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const filterType = filter.type || 'single';

  const handleApplyFilter = useCallback(async () => {
    setError(null);
    const imagesToProcess: string[] = [];
    if (uploadedImage1) {
        imagesToProcess.push(uploadedImage1);
    }
    if (filterType === 'merge' && uploadedImage2) {
        imagesToProcess.push(uploadedImage2);
    }

    if (imagesToProcess.length === 0 || (filterType === 'merge' && imagesToProcess.length < 2)) {
      setError(`Please upload ${filterType === 'merge' ? 'two images' : 'an image'} first.`);
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const result = await applyImageFilter(imagesToProcess, filter.prompt);
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
  }, [uploadedImage1, uploadedImage2, filter.prompt, filterType]);

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

  const isApplyDisabled = isLoading || !uploadedImage1 || (filterType === 'merge' && !uploadedImage2);

  return (
    <>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <button
          onClick={() => setViewState({ view: 'marketplace' })}
          className="flex items-center gap-2 text-content-200 dark:text-dark-content-200 hover:text-content-100 dark:hover:text-dark-content-100 mb-6 font-semibold"
        >
          <BackArrowIcon />
          Back to Marketplace
        </button>

        <div className="bg-base-200 dark:bg-dark-base-200 p-4 sm:p-6 rounded-lg shadow-md border border-border-color dark:border-dark-border-color">
          <div className="text-center mb-4 border-b border-border-color dark:border-dark-border-color pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-content-100 dark:text-dark-content-100">{filter.name}</h2>
              <p className="text-content-200 dark:text-dark-content-200 mt-1 text-sm sm:text-base">{filter.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             {/* Image Display Area */}
            <div className="w-full">
                {generatedImage ? (
                    <div className="w-full max-w-md mx-auto aspect-square bg-base-300 dark:bg-dark-base-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-border-color dark:border-dark-border-color">
                         <img src={generatedImage} alt="Generated result" className="object-contain w-full h-full" />
                         {isLoading && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center gap-4">
                                <Spinner className="h-8 w-8 text-brand-primary dark:text-dark-brand-primary" />
                                <p className="text-content-100 dark:text-dark-content-100 font-semibold">Applying filter...</p>
                            </div>
                         )}
                    </div>
                ) : filterType === 'merge' ? (
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto relative">
                        <ImageUploader id="image-upload-1" image={uploadedImage1} onUpload={setUploadedImage1} label="Image 1" onError={setError} />
                        <ImageUploader id="image-upload-2" image={uploadedImage2} onUpload={setUploadedImage2} label="Image 2" onError={setError} />
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center gap-4 rounded-lg">
                                <Spinner className="h-8 w-8 text-brand-primary dark:text-dark-brand-primary" />
                                <p className="text-content-100 dark:text-dark-content-100 font-semibold">Applying filter...</p>
                            </div>
                         )}
                    </div>
                ) : ( // Single image view
                     <div className="w-full max-w-md mx-auto aspect-square bg-base-300 dark:bg-dark-base-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-border-color dark:border-dark-border-color">
                        {uploadedImage1 ? (
                            <img src={uploadedImage1} alt="User upload" className="object-contain w-full h-full" />
                        ) : (
                             <div className="text-center text-content-200 dark:text-dark-content-200 p-4">
                                <UploadIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2">Upload an image to get started</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center gap-4">
                                <Spinner className="h-8 w-8 text-brand-primary dark:text-dark-brand-primary" />
                                <p className="text-content-100 dark:text-dark-content-100 font-semibold">Applying filter...</p>
                            </div>
                        )}
                    </div>
                )}
                 {error && <p className="text-red-500 dark:text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {/* Controls Area */}
            <div className="flex flex-col gap-4 sticky top-6">
              {filterType === 'single' && !generatedImage && (
                  <label htmlFor="image-upload-1" className="w-full text-center cursor-pointer bg-base-200 hover:bg-base-300 dark:bg-dark-base-200 dark:hover:bg-dark-base-300 border border-border-color dark:border-dark-border-color text-content-100 dark:text-dark-content-100 font-bold py-3 px-4 rounded-lg transition-colors">
                    <span className="flex items-center justify-center gap-2"><UploadIcon /> {uploadedImage1 ? 'Change Image' : 'Upload Image'}</span>
                     <input id="image-upload-1" type="file" accept="image/*" className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) fileToBase64(file).then(setUploadedImage1).catch(() => setError('Failed to read image'));
                     }} />
                  </label>
              )}
               {(generatedImage && (filterType === 'single' || filterType === 'merge')) && (
                <button
                    onClick={() => {
                        setGeneratedImage(null);
                        setUploadedImage1(null);
                        if (filterType === 'merge') setUploadedImage2(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-base-200 hover:bg-base-300 dark:bg-dark-base-200 dark:hover:bg-dark-base-300 border border-border-color dark:border-dark-border-color text-content-100 dark:text-dark-content-100 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <BackArrowIcon /> Start Over
                </button>
               )}


              <button
                onClick={handleApplyFilter}
                disabled={isApplyDisabled}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary dark:bg-dark-brand-primary dark:hover:bg-dark-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-600 dark:disabled:text-gray-400 shadow-sm"
              >
                {generatedImage ? <ReimagineIcon className="h-5 w-5" /> : <SparklesIcon />}
                {isLoading 
                    ? (generatedImage ? 'Reimagining...' : 'Processing...') 
                    : (generatedImage ? 'Reimagine' : 'Apply Filter')
                }
              </button>
              
              {generatedImage && (
                <button
                  onClick={handleShare}
                  disabled={isSharing || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-dark-base-300 dark:hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
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