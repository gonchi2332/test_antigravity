import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setUser(user ?? null);
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Listen for auth changes
        const { data: listener } = authService.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        signIn: authService.signIn,
        signUp: authService.signUp,
        signOut: authService.signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
