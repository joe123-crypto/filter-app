
import React, { useState } from 'react';
import { Filter, User } from '../types';
import Spinner from './Spinner';
import { TrashIcon, EditIcon } from './icons';

interface FilterCardProps {
  filter: Filter;
  onSelect: () => void;
  aspectRatio: string;
  user: User | null;
  onDelete: (filterId: string) => Promise<void>;
  onEdit: (filter: Filter) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({ filter, onSelect, aspectRatio, user, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = user?.email === 'munemojoseph332@gmail.com';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(filter);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing
    
    if (!window.confirm(`Are you sure you want to permanently delete the "${filter.name}" filter? This action cannot be undone.`)) {
        return;
    }

    setIsDeleting(true);
    try {
        await onDelete(filter.id);
        // Component will unmount on success, so no need to reset state.
    } catch (error) {
        // The error is handled globally in App.tsx, but we'll alert here for immediate feedback.
        console.error("Deletion failed for filter:", filter.id, error);
        // We don't alert here because App.tsx displays a more integrated error message.
        setIsDeleting(false);
    }
  };


  return (
    <div
      onClick={onSelect}
      className="bg-base-200 dark:bg-dark-base-200 rounded-lg overflow-hidden shadow-sm border border-border-color dark:border-dark-border-color cursor-pointer group transition-all duration-300 hover:shadow-lg hover:border-brand-primary/50 dark:hover:border-dark-brand-primary/50 hover:-translate-y-1 flex flex-col justify-between break-inside-avoid mb-4 md:mb-6"
    >
      <div>
        <div className={`relative overflow-hidden ${aspectRatio}`}>
          {isAdmin && (
            <div className="absolute top-2 right-2 z-10 flex gap-2 transition-all duration-200 transform group-hover:opacity-100 opacity-0 focus-within:opacity-100">
                <button 
                    onClick={handleEdit}
                    disabled={isDeleting}
                    className="p-2 bg-blue-600/80 hover:bg-blue-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Edit ${filter.name} filter`}
                >
                    <EditIcon />
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 bg-red-600/80 hover:bg-red-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete ${filter.name} filter`}
                >
                    {isDeleting ? <Spinner className="w-5 h-5"/> : <TrashIcon />}
                </button>
            </div>
          )}
          <img
            src={filter.previewImageUrl}
            alt={`Preview of ${filter.name} filter`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <h3 className="absolute bottom-2 left-4 text-xl font-bold text-white">{filter.name}</h3>
        </div>
        <div className="p-4">
          <p className="text-content-200 dark:text-dark-content-200 text-sm">{filter.description}</p>
        </div>
      </div>
      {filter.username && (
        <div className="p-4 pt-0 mt-auto">
            <p className="text-xs text-content-200 dark:text-dark-content-200 truncate">by {filter.username}</p>
        </div>
      )}
    </div>
  );
};

export default FilterCard;