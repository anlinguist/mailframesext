// @ts-nocheck
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithCustomToken } from 'firebase/auth/web-extension';
import { auth } from '../../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            const handleAuthStateChange = async () => {
                if (currentUser) {
                    const result = await chrome.storage.local.get('signOut');
                    if (result.signOut) {
                        console.log('signing out');
                        await chrome.storage.local.remove('signOut');
                        await auth.signOut();
                    }
                }
                setUser(currentUser);
                setLoading(false);
            };
            handleAuthStateChange();
        });

        const checkForCustomToken = async () => {
            const { customToken } = await chrome.storage.local.get();
            if (customToken) {
                await signInWithCustomToken(auth, customToken);
                chrome.storage.local.remove('customToken');
            }
        }
        checkForCustomToken();

        const storageListener = chrome.storage.onChanged.addListener((changes) => {
            if (changes.customToken) {
                const customToken = changes.customToken.newValue;
                if (customToken) {
                    signInWithCustomToken(auth, customToken);
                    chrome.storage.local.remove('customToken');
                }
            }
            if (changes.signOut) {
                const signOut = changes.signOut.newValue;
                if (signOut) {
                    auth.signOut();
                }
            }
        });

        return () => {
            unsubscribe();
            storageListener();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
