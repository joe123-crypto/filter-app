import React, { useState, useCallback } from 'react';
import { Filter, ViewState } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { generatePreviewImage, improvePrompt } from '../services/geminiService';
import { BackArrowIcon, UploadIcon, SparklesIcon } from './icons';
import Spinner from './Spinner';


interface CreateFilterViewProps {
  addFilter: (filter: Omit<Filter, 'id'>) => Promise<void>;
  setViewState: (viewState: ViewState) => void;
}

const CreateFilterView: React.FC<CreateFilterViewProps> = ({ addFilter, setViewState }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState('');

  const handlePreviewUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPreviewImage(base64);
        setError('');
      } catch (err) {
        setError('Failed to load preview image.');
      }
    }
  }, []);
  
  const handleGeneratePreview = useCallback(async () => {
    if (!description) {
      setError('Please provide a description to generate an image.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const generatedImage = await generatePreviewImage(description);
      setPreviewImage(generatedImage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during image generation.');
      }
    } finally {
      setIsGenerating(false);
    }
}, [description]);

 const handleImprovePrompt = useCallback(async () => {
    if (!prompt) {
        setError("Please enter a prompt to improve.");
        return;
    }
    setIsImprovingPrompt(true);
    setError('');
    try {
        const improved = await improvePrompt(prompt);
        setPrompt(improved);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred while improving the prompt.');
        }
    } finally {
        setIsImprovingPrompt(false);
    }
}, [prompt]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !description || !prompt || !previewImage) {
      setError('All fields, including a preview image, are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
        const newFilterData = {
            name,
            description,
            prompt,
            previewImageUrl: previewImage,
        };

        await addFilter(newFilterData);
        setViewState({ view: 'marketplace' });
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred while saving the filter.');
        }
        setIsSaving(false); // Only set to false on error, success navigates away
    }
  };

  const isBusy = isGenerating || isImprovingPrompt || isSaving;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => setViewState({ view: 'marketplace' })}
        className="flex items-center gap-2 text-content-200 hover:text-white mb-6 font-semibold"
      >
        <BackArrowIcon />
        Back to Marketplace
      </button>

      <form onSubmit={handleSubmit} className="bg-base-200 p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-white text-center">Create a New Filter</h2>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-content-100 mb-1">Filter Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-base-300 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder="e.g., '8-Bit Pixel Art'"
            disabled={isBusy}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-content-100 mb-1">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-base-300 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder="A short, catchy description"
            disabled={isBusy}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
              <label htmlFor="prompt" className="block text-sm font-medium text-content-100">AI Prompt</label>
              <button
                  type="button"
                  onClick={handleImprovePrompt}
                  disabled={!prompt || isImprovingPrompt || isSaving}
                  className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-secondary disabled:text-content-200 disabled:cursor-not-allowed transition-colors"
              >
                  {isImprovingPrompt ? (
                      <>
                          <Spinner className="h-4 w-4" /> 
                          <span>Improving...</span>
                      </>
                  ) : (
                      <>
                          <SparklesIcon className="h-4 w-4" />
                          <span>Improve with AI</span>
                      </>
                  )}
              </button>
          </div>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full bg-base-300 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder="Describe the transformation, e.g., 'Turn this photo into a retro pixel art style...'"
            disabled={isBusy}
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-content-100 mb-1">Preview Image</label>
            <div className="mt-1 flex justify-center p-6 border-2 border-gray-600 border-dashed rounded-md relative min-h-[10rem]">
                {(isGenerating || isSaving) && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 rounded-md z-10">
                        <Spinner />
                        <p className="text-white font-semibold">{isSaving ? 'Saving...' : 'Generating image...'}</p>
                    </div>
                )}
                <div className="space-y-2 text-center flex flex-col justify-center items-center">
                    {previewImage ? (
                        <img src={previewImage} alt="Preview" className="mx-auto h-32 w-auto rounded-md object-cover" />
                    ) : (
                        <UploadIcon className="mx-auto h-12 w-12 text-content-200" />
                    )}
                    <div className="flex text-sm text-content-200 justify-center">
                        <label htmlFor="preview-upload" className="relative cursor-pointer bg-base-100 rounded-md font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-1">
                            <span>{previewImage ? 'Change image' : 'Upload an image'}</span>
                            <input id="preview-upload" type="file" className="sr-only" onChange={handlePreviewUpload} accept="image/*" disabled={isBusy} />
                        </label>
                    </div>
                     <p className="text-xs text-content-200">or</p>
                    <button
                        type="button"
                        onClick={handleGeneratePreview}
                        disabled={!description || isGenerating || isSaving}
                        className="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg transition-colors disabled:bg-base-300 disabled:cursor-not-allowed text-sm"
                    >
                        <SparklesIcon className="h-4 w-4" />
                        {previewImage ? 'Try Another One' : 'Generate with AI'}
                    </button>
                </div>
            </div>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg disabled:opacity-50"
          disabled={!name || !description || !prompt || !previewImage || isBusy}
        >
          {isSaving ? 'Saving...' : 'Save Filter'}
        </button>
      </form>
    </div>
  );
};

export default CreateFilterView;