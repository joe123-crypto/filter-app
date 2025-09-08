import React from 'react';

type IconProps = {
  className?: string;
};

export const PlusIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const BackArrowIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 17l-4 4 4-4 2.293 2.293a1 1 0 010 1.414L8 23m10-10l2.293 2.293a1 1 0 010 1.414L15 21l-4 4 4-4 2.293 2.293a1 1 0 010 1.414L13 23" />
    </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const HeaderIcon: React.FC<IconProps> = ({ className = 'h-8 w-8 text-brand-primary dark:text-dark-brand-primary' }) => (
    <svg viewBox="0 0 64 65" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M49.6364 13.5C49.6364 13.5 39.0909 21.9444 34.1818 31.7222C29.2727 41.5 34.1818 48.8333 40.5455 51.0556C46.9091 53.2778 55.2727 51.0556 59.2727 46.6111C55.2727 48.8333 48.9091 47.7222 46.9091 43.2778C44.9091 38.8333 46.9091 35.2778 49.6364 32.8333C49.6364 24.3889 57.2727 21.9444 61.4545 20.8333C57.2727 19.7222 51.6364 17.0556 49.6364 13.5Z" fill="currentColor"/>
        <path d="M4.54545 44.6111C4.54545 44.6111 15.0909 38.3889 23.4545 40.6111C31.8182 42.8333 33.8182 51.0556 29.8182 55.5C25.8182 59.9444 16.2727 61.0556 10.9091 58.8333C13.2727 59.9444 19.6364 58.8333 22.2727 54.3889C24.9091 49.9444 22.2727 46.6111 18.2727 44.6111C14.2727 42.6111 7.90909 42.6111 4.54545 44.6111Z" fill="currentColor"/>
        <path d="M2.18182 54.3889C2.18182 54.3889 12.7273 48.1667 21.0909 50.3889C29.4545 52.6111 31.4545 60.8333 27.4545 64.3889H6.90909C6.90909 64.3889 4.54545 62.1667 2.18182 54.3889Z" fill="currentColor"/>
    </svg>
);


export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.206 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const ReimagineIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-11.667a8.25 8.25 0 00-11.667 0L2.985 7.985" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);

export const DollarIcon: React.FC<IconProps> = ({ className = 'h-8 w-8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.77 10.5 12 10.5c-.77 0-1.536.71-2.098 1.402l-.879.659m7.198-2.818a4.5 4.5 0 00-6.364-6.364m-6.364 6.364a4.5 4.5 0 006.364 6.364" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const RedoIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-11.667a8.25 8.25 0 00-11.667 0L2.985 7.985" />
    </svg>
);


// Theme Icons
export const SunIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
export const MoonIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

// Studio Icons
export const TshirtIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25l1.5-1.5M4.5 20.25l1.5 1.5M19.5 20.25l-1.5-1.5M19.5 20.25l-1.5 1.5M16.5 2.25l-1.5 1.5M16.5 2.25l1.5 1.5M7.5 2.25l1.5 1.5M7.5 2.25l-1.5 1.5M12 6.75v12.75M12 6.75a2.25 2.25 0 012.25-2.25H16.5a2.25 2.25 0 012.25 2.25v3.75a2.25 2.25 0 01-2.25 2.25h-1.5m-3-1.5v-3.75a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25v3.75a2.25 2.25 0 002.25 2.25h1.5m-3-1.5v-3.75a2.25 2.25 0 012.25-2.25H12" />
  </svg>
);
export const JacketIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75l-4.5 4.5v12h18v-12l-4.5-4.5h-9zm0 0v4.5h9v-4.5h-9zm-4.5 4.5h18" />
  </svg>
);
export const HangerIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.5-4.5L12 9.75m0 0L9.75 12m2.25-2.25L12 7.5m0 2.25L9.75 7.5m-2.25 4.5L7.5 12m0 0L5.25 9.75M7.5 12l-2.25 2.25M16.5 14.25L12 18.75m4.5-4.5L18.75 12M12 18.75l-4.5-4.5M12 18.75l4.5 4.5M12 3.75l-4.5 4.5M12 3.75l4.5 4.5" />
    </svg>
);
export const HatIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l3-3m0 0l3 3m-3-3v-6a3 3 0 013-3h3a3 3 0 013 3v6m-3 3l3-3m-3 3v3.75a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V15.75m-3-3h12" />
    </svg>
);
export const AvatarIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
export const LandscapeIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
    </svg>
);
export const FrameIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-6h15m-15-3h15m-15-3h15M3 4.5h18" />
    </svg>
);
export const CityscapeIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75v.75h-.75V6.75zm0 3h.75v.75h-.75V9.75zm0 3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-9h.75v.75h-.75V6.75zm0 3h.75v.75h-.75V9.75zm0 3h.75v.75h-.75v-.75zm0 3h.75v.75h-.75v-.75zm3-9h.75v.75h-.75V6.75zm0 3h.75v.75h-.75V9.75zm0 3h.75v.75h-.75v-.75zm3-9h.75v.75h-.75V6.75zm0 3h.75v.75h-.75V9.75z" />
    </svg>
);
export const ShuffleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-11.667a8.25 8.25 0 00-11.667 0L2.985 7.985" />
    </svg>
);