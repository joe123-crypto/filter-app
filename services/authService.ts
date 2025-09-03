
import { User } from '../types';

// IMPORTANT: This uses the same API Key as the Firestore service.
// Ensure your API key is correctly set in `firebaseService.ts` for this to work.
const firebaseConfig = {
  apiKey: "AIzaSyC3VR98pOpdsYZBlkBCsB8fvUwpvOPlJ1g",
};

const API_KEY = firebaseConfig.apiKey;
const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts";
const USER_SESSION_KEY = "geminiFilterFusionUser";

const handleAuthResponse = async (response: Response): Promise<User> => {
    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data.error?.message || 'An unknown authentication error occurred.';
        // Make error messages more user-friendly
        switch (errorMessage) {
            case 'EMAIL_EXISTS':
                throw new Error('This email is already in use. Please sign in or use a different email.');
            case 'INVALID_LOGIN_CREDENTIALS':
                throw new Error('Invalid email or password. Please check your credentials and try again.');
            case 'WEAK_PASSWORD : Password should be at least 6 characters':
                throw new Error('Your password must be at least 6 characters long.');
            default:
                throw new Error(errorMessage);
        }
    }

    const user: User = {
        uid: data.localId,
        email: data.email,
        idToken: data.idToken,
    };
    
    saveUserSession(user);
    return user;
};


export const signUp = async (email: string, password: string): Promise<User> => {
    const url = `${AUTH_BASE_URL}:signUp?key=${API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });
    return handleAuthResponse(response);
};

export const signIn = async (email: string, password: string): Promise<User> => {
    const url = `${AUTH_BASE_URL}:signInWithPassword?key=${API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
        }),
    });
    return handleAuthResponse(response);
};

export const saveUserSession = (user: User) => {
    try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Could not save user session to local storage:", error);
    }
};

export const loadUserSession = (): User | null => {
    try {
        const sessionData = localStorage.getItem(USER_SESSION_KEY);
        if (!sessionData) return null;
        return JSON.parse(sessionData);
    } catch (error) {
        console.error("Could not load user session from local storage:", error);
        return null;
    }
};

export const signOut = () => {
    try {
        localStorage.removeItem(USER_SESSION_KEY);
    } catch (error) {
        console.error("Could not sign out user:", error);
    }
};
