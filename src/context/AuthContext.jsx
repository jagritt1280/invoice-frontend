import { createContext, useContext, useState } from 'react';

// Context = global state — accessible from any component
// Like a global variable but React-friendly
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );
    // initialize from localStorage → user stays logged in on refresh

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = () => !!user;
    // !! converts to boolean
    // null → false, {name: "Jagrit"} → true

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

// custom hook — use this in any component
export function useAuth() {
    return useContext(AuthContext);
}