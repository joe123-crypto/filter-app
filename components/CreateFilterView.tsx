import React, { useState, useCallback, useRef } from 'react';
import { Filter, ViewState, User } from '../types';
import { generateImageFromPrompt, generateRandomPrompt, categorizeFilter, applyImageFilter } from '../services/geminiService';
import { saveFilter } from '../services/firebaseService';
import { fileToBase64 } from '../utils/fileUtils';
import {
  BackArrowIcon, TshirtIcon, JacketIcon, HangerIcon, HatIcon,
  AvatarIcon, LandscapeIcon, FrameIcon, CityscapeIcon, ShuffleIcon,
  UploadIcon, CloseIcon, RedoIcon
} from './icons';
import Spinner from './Spinner';

interface StudioViewProps {
  setViewState: (viewState: ViewState) => void;
  user: User | null;
  addFilter?: (filter: Filter) => void;
  filterToEdit?: Filter; // Retained for future edit functionality
  onUpdateFilter?: (filter: Filter) => Promise<void>; // Retained
}

const SaveFilterModal: React.FC<{
    onClose: () => void;
    onSave: (name: string, description: string) => void;
    isSaving: boolean;
}> = ({ onClose, onSave, isSaving }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (name && description) {
            onSave(name, description);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-200 dark:bg-dark-base-200 p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
                <h3 className="text-xl font-bold text-content-100 dark:text-dark-content-100">Save your Filter</h3>
                <div>
                    <label htmlFor="filterName" className="block text-sm font-medium text-content-100 dark:text-dark-content-100 mb-1">Filter Name</label>
                    <input id="filterName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-base-100 dark:bg-dark-base-100 border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 text-content-100 dark:text-dark-content-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-dark-brand-primary focus:outline-none" placeholder="e.g., 'Runway Model'" />
                </div>
                <div>
                    <label htmlFor="filterDesc" className="block text-sm font-medium text-content-100 dark:text-dark-content-100 mb-1">Description</label>
                    <input id="filterDesc" type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-base-100 dark:bg-dark-base-100 border border-border-color dark:border-dark-border-color rounded-md px-3 py-2 text-content-100 dark:text-dark-content-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-dark-brand-primary focus:outline-none" placeholder="A short, catchy description" />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-base-300 dark:bg-dark-base-300 text-content-100 dark:text-dark-content-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving || !name || !description} className="py-2 px-4 bg-brand-primary dark:bg-dark-brand-primary text-white rounded-md hover:bg-brand-secondary dark:hover:bg-dark-brand-secondary transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isSaving && <Spinner className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const StudioView: React.FC<StudioViewProps> = ({ setViewState, user, addFilter }) => {
  const [prompt, setPrompt] = useState('A girl in a yellow t-shirt walking on a runway');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for active tools
  const [activeClothing, setActiveClothing] = useState<string>('t-shirt');
  const [activeContext, setActiveContext] = useState<string>('runway');


  if (!user) {
    setViewState({ view: 'auth' });
    return null;
  }
  
  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
        let result;
        if (uploadedImage) {
            result = await applyImageFilter([uploadedImage], prompt);
            // The result of an edit becomes the new base image for further edits
            setUploadedImage(result); 
            setGeneratedImage(null); // Clear any old text-to-image generation
        } else {
            result = await generateImageFromPrompt(prompt);
            setGeneratedImage(result);
        }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during image generation.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, uploadedImage]);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            setError('');
            const base64 = await fileToBase64(file);
            setUploadedImage(base64);
            setGeneratedImage(null); // Clear generated image when a new one is uploaded
            setPrompt("Make this black and white"); // Suggest an initial edit
        } catch (err) {
            setError('Failed to read the image file.');
        }
    }
    // Reset the input value to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  const handleShufflePrompt = useCallback(async () => {
    setIsShuffling(true);
    setError('');
    try {
        const randomPrompt = await generateRandomPrompt();
        setPrompt(randomPrompt);
    } catch (err) {
        if (err instanceof Error) { setError(err.message); } 
        else { setError('An unknown error occurred while generating a prompt.'); }
    } finally {
        setIsShuffling(false);
    }
  }, []);

  const handleToolClick = (type: 'clothing' | 'context', value: string) => {
      let currentPrompt = prompt;
      if (type === 'clothing') {
          // Replace existing clothing items with the new one
          const clothingItems = ['t-shirt', 'jacket', 'hanger', 'hat'];
          clothingItems.forEach(item => {
              const regex = new RegExp(`(wearing a |a |an )${item}`, 'gi');
              currentPrompt = currentPrompt.replace(regex, '');
          });
          currentPrompt += ` wearing a ${value}`;
          setActiveClothing(value);
      } else { // context
          const contextItems = ['avatar', 'landscape', 'frame', 'cityscape', 'runway'];
           contextItems.forEach(item => {
              const regex = new RegExp(`(in a |on a |with a )${item}`, 'gi');
              currentPrompt = currentPrompt.replace(regex, '');
          });
          currentPrompt += ` walking on a ${value}`;
          setActiveContext(value);
      }
      setPrompt(currentPrompt.replace(/, ,/g, ',').replace(/,$/g, '').trim());
  };
  
  const handleStartOver = () => {
      setUploadedImage(null);
      setGeneratedImage(null);
      setPrompt('A girl in a yellow t-shirt walking on a runway');
      setError('');
      setActiveClothing('t-shirt');
      setActiveContext('runway');
  };

  const handleSaveFilter = async (name: string, description: string) => {
    // The image to save is the one currently displayed on screen
    const imageToSave = generatedImage || uploadedImage;
    if (!addFilter || !imageToSave || !prompt || !user) return;

    setIsSaving(true);
    setError('');
    try {
        const category = await categorizeFilter(name, description, prompt);
        const newFilterData = {
            name,
            description,
            prompt,
            previewImageUrl: imageToSave,
            category,
            userId: user.uid,
            username: user.email,
            type: 'single' as 'single' | 'merge',
        };
        const savedFilter = await saveFilter(newFilterData);
        addFilter(savedFilter);
        setIsModalOpen(false);
    } catch (err) {
        if (err instanceof Error) { setError(err.message); } 
        else { setError('An unknown error occurred while saving.'); }
    } finally {
        setIsSaving(false);
    }
  };


  const ToolButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center w-16 h-16 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'bg-brand-primary/10 dark:bg-dark-brand-primary/20 border-brand-primary dark:border-dark-brand-primary text-brand-primary dark:text-dark-brand-primary'
          : 'bg-base-200 dark:bg-dark-base-200 border-border-color dark:border-dark-border-color hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      {icon}
    </button>
  );
  
  const imageToDisplay = uploadedImage || generatedImage;
  const generateButtonText = uploadedImage ? 'Apply Edit' : (generatedImage ? 'Regenerate' : 'Generate');

  return (
    <>
      <div className="animate-fade-in">
        <button
            onClick={() => setViewState({ view: 'marketplace' })}
            className="flex items-center gap-2 text-content-200 dark:text-dark-content-200 hover:text-content-100 dark:hover:text-dark-content-100 mb-6 font-semibold"
        >
            <BackArrowIcon />
            Back to Marketplace
        </button>

        <div className="bg-base-200 dark:bg-dark-base-200 p-4 rounded-xl border border-border-color dark:border-dark-border-color shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left Toolbar */}
                <div className="flex md:flex-col gap-2 p-2 bg-base-100/50 dark:bg-dark-base-100/50 rounded-lg border border-border-color dark:border-dark-border-color self-start">
                    <ToolButton icon={<TshirtIcon />} label="T-Shirt" isActive={activeClothing === 't-shirt'} onClick={() => handleToolClick('clothing', 't-shirt')} />
                    <ToolButton icon={<JacketIcon />} label="Jacket" isActive={activeClothing === 'jacket'} onClick={() => handleToolClick('clothing', 'jacket')} />
                    <ToolButton icon={<HangerIcon />} label="Hanger" isActive={activeClothing === 'hanger'} onClick={() => handleToolClick('clothing', 'hanger')} />
                    <ToolButton icon={<HatIcon />} label="Hat" isActive={activeClothing === 'hat'} onClick={() => handleToolClick('clothing', 'hat')} />
                </div>

                {/* Main Content */}
                <div className="flex-grow flex flex-col gap-4">
                    <div className="aspect-square w-full bg-base-300 dark:bg-dark-base-300 rounded-lg flex items-center justify-center overflow-hidden relative border border-border-color dark:border-dark-border-color">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center gap-4 z-10">
                                <Spinner className="h-8 w-8 text-brand-primary dark:text-dark-brand-primary" />
                                <p className="text-content-100 dark:text-dark-content-100 font-semibold">{uploadedImage ? 'Applying Edit...' : 'Generating...'}</p>
                            </div>
                        )}
                        {imageToDisplay ? (
                            <>
                                <img src={imageToDisplay} alt="User art" className="w-full h-full object-cover" />
                                {uploadedImage && !isLoading && (
                                     <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors" aria-label="Remove uploaded image">
                                         <CloseIcon className="w-5 h-5" />
                                     </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-content-200 dark:text-dark-content-200 p-4 flex flex-col items-center gap-4">
                                <p>Describe an image to generate, or</p>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" id="image-upload-studio" />
                                <label htmlFor="image-upload-studio" className="flex items-center gap-2 bg-base-200 hover:bg-base-300 dark:bg-dark-base-200 dark:hover:bg-dark-base-300 border border-border-color dark:border-dark-border-color text-content-100 dark:text-dark-content-100 font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                                    <UploadIcon /> Upload an image to edit
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="w-full bg-base-200 dark:bg-dark-base-300 border border-border-color dark:border-dark-border-color rounded-lg pl-3 pr-10 py-3 text-content-100 dark:text-dark-content-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-dark-brand-primary focus:outline-none"
                                placeholder={uploadedImage ? "Describe your edits (e.g., add a crown)" : "Describe your image..."}
                                disabled={isLoading}
                            />
                            <button onClick={handleShufflePrompt} disabled={isShuffling || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-content-200 dark:text-dark-content-200 hover:text-brand-primary dark:hover:text-dark-brand-primary rounded-full hover:bg-brand-primary/10 dark:hover:bg-dark-brand-primary/20 disabled:opacity-50">
                                {isShuffling ? <Spinner className="w-5 h-5"/> : <ShuffleIcon />}
                            </button>
                        </div>
                        {imageToDisplay && (
                            <button onClick={handleStartOver} className="flex items-center justify-center gap-2 bg-base-300 hover:bg-gray-300 dark:bg-dark-base-300 dark:hover:bg-gray-600 text-content-100 dark:text-dark-content-100 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm">
                                <RedoIcon /> Start Over
                            </button>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="bg-brand-primary hover:bg-brand-secondary dark:bg-dark-brand-primary dark:hover:bg-dark-brand-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {generateButtonText}
                        </button>
                    </div>
                     {imageToDisplay && (
                        <button onClick={() => setIsModalOpen(true)} className="bg-gray-600 hover:bg-gray-700 dark:bg-dark-base-300 dark:hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm">
                            Save as Filter
                        </button>
                     )}
                     {error && <p className="text-red-500 dark:text-red-400 text-center text-sm">{error}</p>}
                </div>

                {/* Right Toolbar */}
                <div className="flex md:flex-col gap-2 p-2 bg-base-100/50 dark:bg-dark-base-100/50 rounded-lg border border-border-color dark:border-dark-border-color self-start">
                    <ToolButton icon={<AvatarIcon />} label="Avatar" isActive={activeContext === 'avatar'} onClick={() => handleToolClick('context', 'avatar')} />
                    <ToolButton icon={<LandscapeIcon />} label="Landscape" isActive={activeContext === 'landscape'} onClick={() => handleToolClick('context', 'landscape')} />
                    <ToolButton icon={<FrameIcon />} label="Frame" isActive={activeContext === 'frame'} onClick={() => handleToolClick('context', 'frame')} />
                    <ToolButton icon={<CityscapeIcon />} label="Cityscape" isActive={activeContext === 'cityscape'} onClick={() => handleToolClick('context', 'cityscape')} />
                </div>
            </div>
        </div>
      </div>

      {isModalOpen && <SaveFilterModal onClose={() => setIsModalOpen(false)} onSave={handleSaveFilter} isSaving={isSaving} />}
    </>
  );
};

export default StudioView;