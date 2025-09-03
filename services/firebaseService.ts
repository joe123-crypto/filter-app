
import { Filter, User, Share } from '../types';
import { parseDataUrl } from '../utils/fileUtils';


// IMPORTANT: Replace with your Firebase project's configuration.
// Make sure to add your `storageBucket` for the sharing feature.
const firebaseConfig = {
  apiKey: "AIzaSyC3VR98pOpdsYZBlkBCsB8fvUwpvOPlJ1g",
  authDomain: "database-8982a.firebaseapp.com",
  projectId: "database-8982a",
  storageBucket: "database-8982a.appspot.com",
};

const API_KEY = firebaseConfig.apiKey;
const PROJECT_ID = firebaseConfig.projectId;
const STORAGE_BUCKET = firebaseConfig.storageBucket;
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o`;


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

// Helper to transform our Share data into Firestore's REST API format for saving
const transformShareToFirestoreDoc = (shareData: Omit<Share, 'id'>) => {
    return {
        fields: {
            imageUrl: { stringValue: shareData.imageUrl },
            userId: { stringValue: shareData.userId },
            username: { stringValue: shareData.username },
            filterId: { stringValue: shareData.filterId },
            filterName: { stringValue: shareData.filterName },
            createdAt: { timestampValue: new Date().toISOString() },
        }
    };
};

// Helper to transform Firestore's REST API response format to our Share type
const transformFirestoreDocToShare = (doc: any): Share => {
    const id = doc.name.split('/').pop() || '';
    const fields = doc.fields;
    
    return {
        id,
        imageUrl: fields.imageUrl?.stringValue || '',
        filterId: fields.filterId?.stringValue || '',
        filterName: fields.filterName?.stringValue || '',
        userId: fields.userId?.stringValue,
        username: fields.username?.stringValue,
        createdAt: fields.createdAt?.timestampValue || '',
    };
};

/**
 * Fetches all filters from the Firestore database using the REST API.
 * @returns A promise that resolves to an array of filters.
 */
export const getFilters = async (): Promise<Filter[]> => {
    const url = `${FIRESTORE_BASE_URL}/filters?key=${API_KEY}&orderBy=createdAt desc`;
    
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
 */
export const saveFilter = async (filterData: Omit<Filter, 'id'>): Promise<Filter> => {
    const url = `${FIRESTORE_BASE_URL}/filters?key=${API_KEY}`;
    const payload = transformFilterToFirestoreDoc(filterData);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

/**
 * Uploads a base64 image string to Firebase Storage.
 * @returns The public URL of the uploaded image.
 */
export const uploadImageToStorage = async (base64ImageDataUrl: string, userId: string): Promise<string> => {
    const parsedData = parseDataUrl(base64ImageDataUrl);
    if (!parsedData) {
        throw new Error('Invalid image data URL format.');
    }

    const blob = await (await fetch(base64ImageDataUrl)).blob();
    const filename = `shares/${userId}/${Date.now()}.png`;
    const uploadUrl = `${STORAGE_BASE_URL}?uploadType=media&name=${encodeURIComponent(filename)}&key=${API_KEY}`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image to Firebase Storage.');
    }

    // Construct the public URL
    return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filename)}?alt=media`;
};

/**
 * Saves metadata for a shared image to the 'shares' collection in Firestore.
 */
export const saveShareMetadata = async (shareData: Omit<Share, 'id'>): Promise<Share> => {
    const url = `${FIRESTORE_BASE_URL}/shares?key=${API_KEY}`;
    const payload = transformShareToFirestoreDoc(shareData);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to save share metadata.');
    }

    return transformFirestoreDocToShare(data);
};

/**
 * Fetches a single shared image's metadata from Firestore by its ID.
 */
export const getSharedImage = async (shareId: string): Promise<Share> => {
    const url = `${FIRESTORE_BASE_URL}/shares/${shareId}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Could not find the shared image.');
    }

    return transformFirestoreDocToShare(data);
};
