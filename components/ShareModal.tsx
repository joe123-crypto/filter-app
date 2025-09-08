
import React from 'react';
import { DownloadIcon, WhatsAppIcon } from './icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filterName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, imageUrl, filterName }) => {
  if (!isOpen) {
    return null;
  }

  const shareText = `Check out this image I created with the '${filterName}' filter! Create your own here: ${window.location.origin}`;
  const encodedText = encodeURIComponent(shareText);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const downloadFilename = `filtered-${filterName.toLowerCase().replace(/\s/g, '-')}.png`;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-base-200 dark:bg-dark-base-200 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-content-100 dark:text-dark-content-100">Share Image</h3>
            <button
                onClick={onClose}
                className="text-content-200 dark:text-dark-content-200 hover:text-content-100 dark:hover:text-dark-content-100 transition-colors"
                aria-label="Close modal"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <img
          src={imageUrl}
          alt={`Image with ${filterName} filter applied`}
          className="w-full aspect-square object-contain rounded-lg mb-4 bg-base-300 dark:bg-dark-base-300"
        />

        <div className="bg-base-300/50 dark:bg-dark-base-300/50 p-3 rounded-lg text-sm text-left mb-5 space-y-2">
            <p className="font-bold text-content-100 dark:text-dark-content-100">How to share on WhatsApp:</p>
            <ol className="list-decimal list-inside text-content-200 dark:text-dark-content-200">
                <li>Tap 'Share to WhatsApp' below.</li>
                <li>Tap 'Download Image'.</li>
                <li>In WhatsApp, attach the downloaded image to your message.</li>
            </ol>
        </div>

        <div className="flex flex-col gap-3">
             <a
                href={imageUrl}
                download={downloadFilename}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-dark-base-300 dark:hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                <DownloadIcon />
                Download Image
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
            >
              <WhatsAppIcon />
              Share to WhatsApp
            </a>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;