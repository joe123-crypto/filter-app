import { User } from '../types';

// The API Key is hardcoded for prototyping purposes as requested.
const API_KEY = "AIzaSyC3VR98pOpdsYZBlkBCsB8fvUwpvOPlJ1g";
const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts";
const USER_SESSION_KEY = "genieUser";

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
        refreshToken: data.refreshToken,
        // Calculate the token's expiration timestamp in milliseconds
        expiresAt: Date.now() + (parseInt(data.expiresIn, 10) * 1000),
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


/**
 * Retrieves a valid ID token, refreshing it if it's expired or about to expire.
 * @returns A promise that resolves to a valid ID token string, or null if the user is not signed in or refresh fails.
 */
export const getValidIdToken = async (): Promise<string | null> => {
    const user = loadUserSession();
    if (!user) {
        return null;
    }

    // Check if the token is still valid with a 5-minute buffer
    if (Date.now() < user.expiresAt - 5 * 60 * 1000) {
        return user.idToken;
    }

    // Token has expired or is about to, so refresh it
    console.log("ID token expired, refreshing...");
    const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: user.refreshToken,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            // If refresh fails, the user is effectively logged out
            signOut();
            throw new Error(data.error?.message || 'Session expired. Please sign in again.');
        }

        const updatedUser: User = {
            ...user,
            idToken: data.id_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + (parseInt(data.expires_in, 10) * 1000),
        };

        saveUserSession(updatedUser);
        return updatedUser.idToken;

    } catch (error) {
        console.error("Failed to refresh auth token:", error);
        signOut(); // Sign out on failure to prevent further errors
        return null;
    }
};