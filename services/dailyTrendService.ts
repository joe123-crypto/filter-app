import { Filter } from '../types';
import { generateTrendingFilter } from './geminiService';
import { saveFilter } from './firebaseService';

const LAST_TREND_CHECK_KEY = 'lastTrendCheck';

/**
 * Checks if a daily trending filter needs to be generated. If so, it creates one
 * using the Gemini API and saves it to Firestore.
 * @returns A promise that resolves to the newly created Filter object, or null if no filter was created.
 */
export const checkAndGenerateDailyTrend = async (): Promise<Filter | null> => {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const lastCheck = localStorage.getItem(LAST_TREND_CHECK_KEY);

    if (lastCheck === today) {
        console.log("Daily trend filter already generated today.");
        return null;
    }

    console.log("Generating new daily trend filter...");

    try {
        const generatedData = await generateTrendingFilter();

        const newFilterData = {
            ...generatedData,
            category: 'Trending', // Always place in the 'Trending' category
        };

        const savedFilter = await saveFilter(newFilterData);

        // If successful, update the local storage to prevent re-generation today
        localStorage.setItem(LAST_TREND_CHECK_KEY, today);
        console.log("Successfully generated and saved daily trend filter:", savedFilter.name);

        return savedFilter;
    } catch (error) {
        console.error("Failed to generate or save the daily trend filter:", error);
        // We re-throw the error so the calling function can be aware of the failure.
        throw error;
    }
};