import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, orderBy, query, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { Filter } from '../types';

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3VR98pOpdsYZBlkBCsB8fvUwpvOPlJ1g",
  authDomain: "database-8982a.firebaseapp.com",
  projectId: "database-8982a",
  storageBucket: "database-8982a.appspot.com",
  messagingSenderId: "766882916139",
  appId: "1:766882916139:web:e0e7dde168954336ce076e",
  measurementId: "G-5HKL0YBCG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const filtersCollection = collection(db, "filters");

const mapDocToFilter = (doc: QueryDocumentSnapshot<DocumentData, DocumentData>): Filter => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        previewImageUrl: data.previewImageUrl,
    };
};

export const getFilters = async (): Promise<Filter[]> => {
    try {
        const q = query(filtersCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapDocToFilter);
    } catch (error) {
        console.error("Error fetching filters from Firestore:", error);
        // Throw the error to be handled by the calling component
        throw new Error("Could not fetch filters from the database.");
    }
};

export const saveFilter = async (filterData: Omit<Filter, 'id'>): Promise<Filter> => {
    try {
        const docRef = await addDoc(filtersCollection, {
            ...filterData,
            createdAt: serverTimestamp() // Add a timestamp for sorting
        });
        return {
            ...filterData,
            id: docRef.id,
        };
    } catch (error) {
        console.error("Error saving filter to Firestore:", error);
        throw new Error("Could not save the new filter to the database.");
    }
};