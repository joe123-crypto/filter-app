
import React, { useMemo } from 'react';
import { Filter, ViewState, User } from '../types';
import FilterCard from './FilterCard';
import { PlusIcon } from './icons';

interface MarketplaceProps {
  filters: Filter[];
  onSelectFilter: (filter: Filter) => void;
  user: User | null;
  onDeleteFilter: (filterId: string) => Promise<void>;
  onEditFilter: (filter: Filter) => void;
}

const ASPECT_RATIOS = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'];

const Marketplace: React.FC<MarketplaceProps> = ({ filters, onSelectFilter, user, onDeleteFilter, onEditFilter }) => {

  const { trendingSection, otherSections } = useMemo(() => {
    // Sort by access count, descending. Filters without a count are last.
    const sortedFilters = [...filters].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

    // Get top 5 filters, but only if they have been accessed at least once.
    const trendingFilters = sortedFilters.slice(0, 5).filter(f => (f.accessCount || 0) > 0);
    const trendingIds = new Set(trendingFilters.map(f => f.id));

    // All other filters are not trending.
    const otherFilters = filters.filter(f => !trendingIds.has(f.id));
    
    // Group other filters by their category.
    const categoriesMap = new Map<string, Filter[]>();
    otherFilters.forEach(filter => {
        let category = filter.category;
        // If a filter has the legacy "Trending" category but isn't popular enough
        // to be in the main trending section, re-categorize it to avoid confusion.
        if (category === 'Trending') {
            category = 'AI Generated';
        }

        if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
        }
        categoriesMap.get(category)!.push(filter);
    });
    
    // Sort categories for consistent display order.
    const preferredOrder = ['AI Generated', 'Useful', 'Fun'];
    const sortedCategoryNames = Array.from(categoriesMap.keys()).sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const otherSections = sortedCategoryNames.map(categoryName => ({
        name: categoryName,
        filters: categoriesMap.get(categoryName) || [],
    }));

    return { trendingSection: { name: 'Trending', filters: trendingFilters }, otherSections };
  }, [filters]);


  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-100 dark:text-dark-content-100 text-center sm:text-left">Filter Marketplace</h2>
      </div>

      {filters.length === 0 && (
         <div className="text-center bg-base-200 dark:bg-dark-base-200 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-content-100 dark:text-dark-content-100">The Marketplace is Empty!</h3>
            <p className="text-content-200 dark:text-dark-content-200 mt-2 mb-4">Be the first to create and share a new filter with the community.</p>
        </div>
      )}

      <div className="space-y-10">
        {trendingSection.filters.length > 0 && (
            <section>
                <h3 className="text-2xl font-bold text-content-100 dark:text-dark-content-100 mb-4 border-b-2 border-base-300 dark:border-dark-border-color pb-2">{trendingSection.name}</h3>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6">
                    {trendingSection.filters.map((filter, index) => (
                        <FilterCard
                            key={filter.id}
                            filter={filter}
                            onSelect={() => onSelectFilter(filter)}
                            aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                            user={user}
                            onDelete={onDeleteFilter}
                            onEdit={onEditFilter}
                        />
                    ))}
                </div>
            </section>
        )}
        {otherSections.map(categorySection => {
            if (categorySection.filters.length === 0) return null;
            return (
                <section key={categorySection.name}>
                    <h3 className="text-2xl font-bold text-content-100 dark:text-dark-content-100 mb-4 border-b-2 border-base-300 dark:border-dark-border-color pb-2">{categorySection.name}</h3>
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6">
                        {categorySection.filters.map((filter, index) => (
                            <FilterCard
                                key={filter.id}
                                filter={filter}
                                onSelect={() => onSelectFilter(filter)}
                                aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                                user={user}
                                onDelete={onDeleteFilter}
                                onEdit={onEditFilter}
                            />
                        ))}
                    </div>
                </section>
            );
        })}
      </div>
    </div>
  );
};

export default Marketplace;