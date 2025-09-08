
import { Filter, User, Share } from '../types';
import { parseDataUrl } from '../utils/fileUtils';
import { firebaseConfig } from '../config';


// IMPORTANT: Configuration is now imported from the central config.ts file.
const API_KEY = process.env.API_KEY;
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
        type: fields.type?.stringValue === 'merge' ? 'merge' : 'single',
        userId: fields.userId?.stringValue,
        username: fields.username?.stringValue,
        accessCount: fields.accessCount ? parseInt(fields.accessCount.integerValue, 10) : 0,
        // FIX: Read the createdAt timestamp from the Firestore document.
        createdAt: fields.createdAt?.timestampValue,
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

    if (filterData.type) {
        fields.type = { stringValue: filterData.type };
    }
    if (filterData.userId) {
        fields.userId = { stringValue: filterData.userId };
    }
    if (filterData.username) {
        fields.username = { stringValue: filterData.username };
    }
    if (filterData.accessCount !== undefined) {
        fields.accessCount = { integerValue: filterData.accessCount.toString() };
    }

    return { fields };
};

// Helper to transform partial filter data into Firestore's REST API format for updates
const transformFilterToFirestoreFields = (filterData: Partial<Omit<Filter, 'id'>>) => {
    const fields: any = {};
    if (filterData.name !== undefined) fields.name = { stringValue: filterData.name };
    if (filterData.description !== undefined) fields.description = { stringValue: filterData.description };
    if (filterData.prompt !== undefined) fields.prompt = { stringValue: filterData.prompt };
    if (filterData.previewImageUrl !== undefined) fields.previewImageUrl = { stringValue: filterData.previewImageUrl };
    if (filterData.category !== undefined) fields.category = { stringValue: filterData.category };
    if (filterData.type !== undefined) fields.type = { stringValue: filterData.type };
    // We don't update createdAt, userId, username, or accessCount during an edit.
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
 * Fetches all filters from the Firestore database using the REST API,
 * handling pagination to ensure all documents are retrieved.
 * @returns A promise that resolves to an array of all filters.
 */
export const getFilters = async (): Promise<Filter[]> => {
    let allFilters: Filter[] = [];
    let pageToken: string | undefined = undefined;
    const baseUrl = `${FIRESTORE_BASE_URL}/filters?key=${API_KEY}&orderBy=createdAt desc`;

    try {
        do {
            let url = baseUrl;
            if (pageToken) {
                // Append the pageToken to fetch the next page of results
                url += `&pageToken=${pageToken}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error?.message || 'Failed to fetch data from Firestore.';
                throw new Error(errorMsg);
            }

            if (data.documents && data.documents.length > 0) {
                const filtersFromPage = data.documents.map(transformFirestoreDocToFilter);
                allFilters = allFilters.concat(filtersFromPage);
            }

            // Get the token for the next page, if it exists
            pageToken = data.nextPageToken;

        } while (pageToken); // Continue fetching as long as there's a next page

        return allFilters;

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
    const payload = transformFilterToFirestoreDoc({...filterData, accessCount: 0});

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
 * Updates an existing filter in the Firestore database using the REST API.
 * Requires an auth token.
 */
export const updateFilter = async (filterId: string, filterData: Partial<Omit<Filter, 'id'>>, idToken: string): Promise<Filter> => {
    // We need to specify which fields to update using updateMask.
    // Firestore REST API requires field paths in the query string.
    const updateMaskParams = Object.keys(filterData)
        .map(key => `updateMask.fieldPaths=${key}`)
        .join('&');

    const url = `${FIRESTORE_BASE_URL}/filters/${filterId}?key=${API_KEY}&${updateMaskParams}`;
    
    const payload = transformFilterToFirestoreFields(filterData);

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || 'Failed to update filter in Firestore.';
             if (errorMsg.includes('PERMISSION_DENIED')) {
                 throw new Error('Permission Denied. You might not have the rights to edit this filter. Ensure Firestore rules are set up correctly for authenticated updates.');
            }
            throw new Error(errorMsg);
        }
        
        return transformFirestoreDocToFilter(data);

    } catch (error) {
        console.error("Firestore REST API update error:", error);
         if (error instanceof Error) {
            throw new Error(`Could not update the filter. Please try again. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while updating the filter.");
    }
};

/**
 * Deletes a filter from the Firestore database using the REST API.
 * Requires an auth token.
 */
export const deleteFilter = async (filterId: string, idToken: string): Promise<void> => {
    const url = `${FIRESTORE_BASE_URL}/filters/${filterId}?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            const errorMsg = data.error?.message || 'Failed to delete filter from Firestore.';
            if (errorMsg.includes('PERMISSION_DENIED')) {
                 throw new Error('Permission Denied. You might not have the rights to delete this filter. Ensure Firestore rules are set up correctly for authenticated deletes.');
            }
            throw new Error(errorMsg);
        }
        
    } catch (error) {
        console.error("Firestore REST API delete error:", error);
         if (error instanceof Error) {
            throw new Error(`Could not delete the filter. Please try again. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while deleting the filter.");
    }
};

/**
 * Atomically increments the accessCount of a filter.
 * This is a non-critical background task; errors are logged but not thrown.
 */
export const incrementFilterAccessCount = async (filterId: string): Promise<void> => {
    const url = `${FIRESTORE_BASE_URL}:commit?key=${API_KEY}`;
    const payload = {
        writes: [
            {
                transform: {
                    document: `projects/${PROJECT_ID}/databases/(default)/documents/filters/${filterId}`,
                    fieldTransforms: [
                        {
                            fieldPath: 'accessCount',
                            increment: { integerValue: '1' },
                        },
                    ],
                },
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const data = await response.json();
            const errorMsg = data.error?.message || 'Failed to increment access count.';
            // Log the error but don't disrupt the user experience
            console.warn(`Could not update access count for filter ${filterId}: ${errorMsg}`);
        }
    } catch (error) {
        console.error("Firestore increment error:", error);
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