
import { Filter, User } from '../types';

// IMPORTANT: Replace with your Firebase project's configuration.
const firebaseConfig = {
  apiKey: "AIzaSyC3VR98pOpdsYZBlkBCsB8fvUwpvOPlJ1g",
  authDomain: "database-8982a.firebaseapp.com",
  projectId: "database-8982a",
};

const API_KEY = firebaseConfig.apiKey;
const PROJECT_ID = firebaseConfig.projectId;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper to transform Firestore's REST API response format to our simple Filter type
const transformFirestoreDocToFilter = (doc: any): Filter => {
    const id = doc.name.split('/').pop() || '';
    const fields = doc.fields;
    
    return {
        id,
        name: fields.name?.stringValue || '',
        description: fields.description?.stringValue || '',
        prompt: fields.prompt?.stringValue || '',
        previewImageUrl: fields.previewImageUrl?.stringValue || '',
        category: fields.category?.stringValue || 'Useful',
        userId: fields.userId?.stringValue,
        username: fields.username?.stringValue,
    };
};

// Helper to transform our simple filter data into Firestore's REST API format for saving
const transformFilterToFirestoreDoc = (filterData: Omit<Filter, 'id'>) => {
    const fields: any = {
        name: { stringValue: filterData.name },
        description: { stringValue: filterData.description },
        prompt: { stringValue: filterData.prompt },
        previewImageUrl: { stringValue: filterData.previewImageUrl },
        category: { stringValue: filterData.category },
        createdAt: { timestampValue: new Date().toISOString() },
    };

    if (filterData.userId) {
        fields.userId = { stringValue: filterData.userId };
    }
    if (filterData.username) {
        fields.username = { stringValue: filterData.username };
    }

    return { fields };
};

/**
 * Fetches all filters from the Firestore database using the REST API.
 * @returns A promise that resolves to an array of filters.
 */
export const getFilters = async (): Promise<Filter[]> => {
    const url = `${BASE_URL}/filters?key=${API_KEY}&orderBy=createdAt desc`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || 'Failed to fetch data from Firestore.';
            throw new Error(errorMsg);
        }

        if (!data.documents) {
            return []; // No filters found
        }
        
        const filters = data.documents.map(transformFirestoreDocToFilter);
        return filters;

    } catch (error) {
        console.error("Firestore REST API fetch error:", error);
        if (error instanceof Error) {
            if (error.message.includes('requires an index')) {
                 throw new Error("Failed to load filters: The database requires an index. Check the browser console for a link to create it in the Firebase console.");
            }
             throw new Error(`Failed to load filters from the database. Please check your API key, network connection, and Firestore REST API permissions. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching filters.");
    }
};


/**
 * Saves a new filter to the Firestore database using the REST API.
 * @param filterData The filter data to save (without an ID).
 * @param user The user creating the filter.
 * @returns The newly created filter object with its Firestore-generated ID.
 */
export const saveFilter = async (filterData: Omit<Filter, 'id'>): Promise<Filter> => {
    const url = `${BASE_URL}/filters?key=${API_KEY}`;
    const payload = transformFilterToFirestoreDoc(filterData);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || 'Failed to save data to Firestore.';
            throw new Error(errorMsg);
        }
        
        return transformFirestoreDocToFilter(data);

    } catch (error) {
        console.error("Firestore REST API save error:", error);
         if (error instanceof Error) {
            throw new Error(`Could not save the filter. Please try again. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while saving the filter.");
    }
};
